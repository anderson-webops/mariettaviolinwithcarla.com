# Guarded build dependencies

The static-site build uses reviewed, MIT-licensed maintained libraries from canonical Vitesse source `5d27a700fca7e36eb8a7f2f728ddd028cbd57000`. Root npm overrides resolve Braces, Deepmerge and Listhen to reproducible archives rather than folder-linked npm projects. Their complete original source and licenses remain under `vendor/`; `vendor/local-libraries/INPUTS.json` binds all 39 source files to the reviewed canonical revision.

- `vendor/listhen` replaces `node-forge` with `selfsigned` for temporary development TLS certificates while preserving HTTP, PEM, PFX, ESM, CommonJS, and CLI behavior. It executes its trusted bundled desktop helper without trusting or writing a shared temporary executable. This removes the affected dependency path for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
- `vendor/braces` bounds parser and AST-walker nesting, cumulative expansion items and bytes, and range expansion while preserving ordinary patterns. This addresses [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and bounds shallow combinatorial expansion.

Braces `3.0.4-webops.3`, Deepmerge `4.3.2-webops.2` and Listhen `1.10.1-webops.3` reproduce the canonical archives byte-for-byte. The producer uses this static site's existing native-provider archive helper; independent reproduction verifies identical output. `npm run verify:local-libraries` checks source hashes, immutable archives, consuming lock identities, installed bytes and executable modes. The cold-install/update/clean-install regression uses a fresh private download cache and verifies that every Jiti consumer retains the maintained loader. Original framework comparison archives remain unchanged.

`npm test` checks both fork behavior and lockfile resolution. Retain the forks until upstream fixes pass the same tests and full and production dependency audits. The only production output remains `front-end/dist`; neither fork is included as a runtime service.

## Current build qualification

The project uses [Node 26.13.1 LTS](https://nodejs.org/en/blog/release/v26.13.1) and the independently locked npm 12.2.2 build profile. Official Linux Node 26 binaries may require `libatomic`. The application selects maintained Nuxt 4.6.4 and Vite 8.3.8 providers with Vue 3.5.45. Explicit Linux native bindings match their consuming packages. The [shared build contract](shared-build-compatibility.md) records the native, framework, schema and compiler boundaries.

Targeted overrides retain patched `compression`, `fast-uri`, `serialize-javascript`, and `shell-quote`. The math extension uses KaTeX 0.18.2 because its upstream range still selects the affected 0.16 line; the formatter uses Tinypool 2.2.0 because its upstream version is pinned. Ordinary math rendering and formatter execution were checked locally. The `devalue` 5 override is scoped to its original major so Nuxt can use its required version 6.

Nuxt 4.6.4 retains its original `unimport ^7.0.2` requirement. The compatible `7.0.2+webops.3` provider is reproduced under Node 26.13.1 from the complete signed upstream source, with original licenses, independent build/runtime locks and upstream tests. The registry's advertised 7.0.2 attestation remains unverified. The [signed-source provider contract](signed-source-auto-import-provider.md) defines the independently verified replacement and installed-byte checks.

The [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) and [glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) require new major versions. The application lock selects `minimatch` 11.0.5 and `glob` 14.0.6. `scripts/patch-minimatch-consumers.mjs` applies SHA-bound compatibility changes to `serve-handler` 6.1.7's callable import and `eslint-plugin-import-x` 4.17.1's removed `makeRe` use after every clean install. Unexpected upstream bytes fail the install instead of silently discarding the patches. Focused regressions cover the ESM/CommonJS import rule and serve-handler's globbed headers.

Release qualification requires a clean locked application and all applicable independent graphs, dependency and native-lock checks, Linux ARM64 glibc and musl installations, full and production audits, lint, typecheck, source tests, static build, accessibility, browser acceptance and exact immutable artifact checks. The three-profile shared build cache remains bounded; compatible sites reuse its verified profile rather than altering shared bytes.

Full and production npm audits and registry signature/provenance verification are separate required gates. Keep all three enabled; a clean vulnerability audit does not replace provenance verification.
