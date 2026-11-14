import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'
import { selectedNpmCli, stableVersionAtLeast } from './build-toolchain-state.mjs'
import { assertNativeProviderBindings } from './native-lock-contract.mjs'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const frontend = JSON.parse(await readFile(path.join(root, 'front-end/package.json'), 'utf8'))
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'))

test('the secured build runtime is aligned without adding a production Node service', async () => {
  const metadata = JSON.parse(await readFile(path.join(root, 'build-toolchain/UPSTREAM.json'), 'utf8'))
  const payload = JSON.parse(await readFile(path.join(root, 'build-toolchain/PAYLOAD.json'), 'utf8'))
  const contract = JSON.parse(await readFile(path.join(root, 'deploy/static-artifact.json'), 'utf8'))
  const node = metadata.node
  assert.ok(stableVersionAtLeast(node, [26, 13, 1], true))
  assert.equal(process.version, `v${node}`)
  assert.equal(manifest.engines.node, `>=${node} <27`)
  assert.equal(frontend.engines.node, manifest.engines.node)
  assert.equal(manifest.devEngines.runtime.version, manifest.engines.node)
  for (const filename of ['.node-version', '.nvmrc'])
    assert.equal((await readFile(path.join(root, filename), 'utf8')).trim(), node)
  const workflow = await readFile(path.join(root, '.github/workflows/ci.yml'), 'utf8')
  assert.ok(workflow.split('\n').includes(`  NODE_VERSION: ${node}`))
  assert.ok((await readFile(path.join(root, 'netlify.toml'), 'utf8')).includes(`NODE_VERSION = "${node}"`))
  const preparation = await readFile(path.join(root, 'deploy/direct/prepare-static-release.sh'), 'utf8')
  assert.ok(preparation.includes(`/opt/node-${node}/bin`))
  assert.ok(preparation.includes(`"v${node}"`))
  const digest = createHash('sha256').update(await readFile(path.join(root, 'build-toolchain/package-lock.json'))).digest('hex')
  assert.equal(metadata.lockSha256, digest)
  assert.equal(payload.lockSha256, digest)
  assert.equal(contract.runtime.type, 'static')
  assert.equal(contract.runtime.applicationProcesses, 0)
  assert.deepEqual(contract.productionDependencies, [])
})

test('the static application declares its qualified shared providers and preserves both compiler contracts', () => {
  assert.deepEqual(manifest.workspaces, ['front-end'])
  for (const [name, version] of Object.entries({
    'oxfmt': '0.78.0',
    'oxc-parser': '0.158.0',
    'rolldown': '1.3.2',
    '@vitejs/devtools-kit': '0.8.2',
    '@vitejs/devtools': '0.8.2',
    'vite': 'file:vendor/vite-8.3.8-webops.1.tgz',
    'nuxt': 'file:vendor/nuxt-4.6.4-webops.2.tgz',
    'typescript-native': 'npm:typescript@7.0.2',
    'typescript': '^6.0.3',
  }))
    assert.equal(manifest.devDependencies[name], version, name)
  assert.equal(lock.packages['back-end'], undefined)
  assert.equal(manifest.version, frontend.version)
  assert.equal(manifest.allowScripts['file:vendor/rollup-plugin-inject-5.0.5-webops.1.tgz'], false)
})

test('install-script denial follows the exact local archive identity rather than its claimed package name', () => {
  const allowed = createRequire(selectedNpmCli())('@npmcli/arborist/lib/script-allowed.js')
  const dependency = {
    root: { path: root },
    resolved: `file:${path.join(root, 'vendor/rollup-plugin-inject-5.0.5-webops.1.tgz')}`,
    package: { name: '@rollup/plugin-inject', version: '5.0.5-webops.1' },
  }
  assert.equal(allowed(dependency, manifest.allowScripts), false)
  const unreviewed = {
    ...dependency,
    resolved: `file:${path.join(root, 'unreviewed.tgz')}`,
  }
  assert.equal(allowed(unreviewed, manifest.allowScripts), null)
})

test('independent signature audits include project-root dependency edges and single-leaf compiler graphs', async () => {
  const sources = [
    await readFile(path.join(root, 'scripts/audit-shared-build-fixtures.sh'), 'utf8'),
    await readFile(path.join(root, 'scripts/prepare-unimport-source.sh'), 'utf8'),
    manifest.scripts['audit:unimport-source'],
  ]
  const commands = sources.flatMap(source => source.split(/\n|&&/u))
    .filter(command => command.includes('npm audit signatures --prefix'))
  assert.equal(commands.length, 5)
  for (const command of commands)
    assert.doesNotMatch(command, /--workspaces=false/u)
})

test('Linux native declarations match actual application engines rather than unrelated installed bindings', () => {
  assert.equal(assertNativeProviderBindings(frontend, lock), 26)
  for (const [bindingPrefix, provider] of [
    ['@oxfmt/binding-linux-', 'oxfmt'],
    ['@oxc-parser/binding-linux-', 'oxc-parser'],
    ['@rolldown/binding-linux-', 'rolldown'],
    ['@rollup/rollup-linux-', 'rollup'],
  ]) {
    const installed = lock.packages[`node_modules/${provider}`]
    assert.ok(installed, provider)
    const bindings = Object.entries(frontend.optionalDependencies).filter(([name]) => name.startsWith(bindingPrefix))
    assert.equal(bindings.length, 4, provider)
    for (const [name, version] of bindings) {
      assert.equal(version, installed.version, `${name} must match ${provider}`)
      assert.equal(lock.packages[`node_modules/${name}`]?.version, installed.version, name)
    }
  }
})

test('a stale binding declaration cannot qualify through an unrelated matching lock entry', () => {
  const stale = structuredClone(frontend)
  const historical = structuredClone(lock)
  const name = '@unrs/resolver-binding-linux-arm64-gnu'
  stale.optionalDependencies[name] = '1.12.2'
  historical.packages[`front-end/node_modules/${name}`] = { version: '1.12.2' }
  assert.throws(() => assertNativeProviderBindings(stale, historical), /must match unrs-resolver/u)
})

test('the selected native provider cannot resolve a mismatched shadowing binding', () => {
  const shadowed = structuredClone(lock)
  const name = '@unrs/resolver-binding-linux-arm64-gnu'
  shadowed.packages[`node_modules/unrs-resolver/node_modules/${name}`] = { version: '1.12.2' }
  assert.throws(() => assertNativeProviderBindings(frontend, shadowed), /must resolve from unrs-resolver/u)
})

test('newer upstream tracing and its genuine Glob dependency floor are retained', () => {
  const tracing = lock.packages['node_modules/@vercel/nft']
  const components = tracing.version.split('.').map(Number)
  assert.ok(components.every(Number.isInteger))
  assert.ok(components[0] > 1 || (components[0] === 1 && (components[1] > 11 || (components[1] === 11 && components[2] >= 2))))
  assert.equal(manifest.overrides.glob, '14.0.6')
  assert.equal(lock.packages['node_modules/glob'].version, '14.0.6')
})

test('original framework controls retain their own package trees and compatible configuration peer scopes', async () => {
  const directory = path.join(root, 'vendor/framework-parents/upstream')
  const original = createRequire(path.join(directory, 'package.json'))
  const reference = JSON.parse(await readFile(path.join(directory, 'package-lock.json'), 'utf8'))
  const metadata = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'))
  assert.equal(metadata.overrides.c12, undefined)
  assert.equal(reference.packages['node_modules/c12'].version, '3.3.4')
  assert.equal(reference.packages['node_modules/@unhead/bundler'].version, '3.4.3')
  assert.equal(reference.packages['node_modules/@vitejs/devtools-kit'].version, '0.7.6')
  assert.equal(manifest.devDependencies['@vitejs/devtools-kit'], '0.8.2')
  for (const name of ['braces', 'deepmerge', 'listhen']) {
    assert.notEqual(reference.packages[`node_modules/${name}`].link, true, name)
    assert.ok(original.resolve(name).startsWith(`${directory}/node_modules/`), name)
  }
  const braceParent = createRequire(original.resolve('braces'))
  assert.ok(braceParent.resolve('fill-range').startsWith(`${directory}/node_modules/`))
  const originalNitro = createRequire(original.resolve('nitropack/package.json'))
  assert.equal(originalNitro.resolve('c12'), original.resolve('c12'))
  assert.equal(reference.packages['node_modules/nitropack'].dependencies.c12, '^3.3.4')
})
