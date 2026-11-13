import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { nodeIdentity, verifyReusableToolchain } from './build-toolchain-cache.mjs'
import { selectedNpmCli } from './build-toolchain-state.mjs'

const prefix = path.resolve(path.dirname(selectedNpmCli()), '../../..')
const receipt = verifyReusableToolchain(prefix, nodeIdentity())
for (const filename of ['package.json', 'front-end/package.json']) {
  const manifest = JSON.parse(readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8'))
  assert.equal(manifest.packageManager, `npm@${receipt.versions.npm}`)
  assert.equal(manifest.engines.node, `>=${receipt.node} <27`)
}
for (const filename of ['.node-version', '.nvmrc'])
  assert.equal(readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8').trim(), receipt.node)
const contract = JSON.parse(readFileSync(new URL('../deploy/static-artifact.json', import.meta.url), 'utf8'))
assert.equal(contract.runtime.type, 'static')
assert.equal(contract.runtime.applicationProcesses, 0)
assert.deepEqual(contract.productionDependencies, [])
assert.deepEqual(contract.nativeBindings, [])
process.stdout.write(`${JSON.stringify(receipt)}\n`)
