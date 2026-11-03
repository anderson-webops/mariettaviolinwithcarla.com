# Guarded build dependencies

The static-site build uses the reviewed Vitesse template `v2.1.4` fixes for two unpatched transitive advisories. Root npm overrides resolve `listhen` and `braces` to local, MIT-licensed forks under `vendor/`.

- `vendor/listhen` replaces `node-forge` with `selfsigned` for temporary development TLS certificates while preserving HTTP, PEM, PFX, ESM, CommonJS, and CLI behavior. This removes the affected dependency path for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
- `vendor/braces` bounds parser and AST-walker nesting while preserving ordinary patterns. This addresses [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

`npm test` checks both fork behavior and lockfile resolution. Retain the forks until upstream fixes pass the same tests and full and production dependency audits. The only production output remains `front-end/dist`; neither fork is included as a runtime service.

## October 2026 refresh

The project uses [Node 26.13.0 LTS](https://nodejs.org/en/blog/release/v26.13.0) and npm 12.2.1. Official Linux Node 26 binaries may require `libatomic`. Nuxt 4.6.3, Vite 8.3.5, Vue 3.5.44, and the refreshed root lockfile replace affected production and development dependencies. Explicit Linux native bindings match their consuming packages.

Targeted overrides retain patched `compression`, `fast-uri`, `serialize-javascript`, and `shell-quote`. The math extension uses KaTeX 0.18.2 because its upstream range still selects the affected 0.16 line; the formatter uses Tinypool 2.2.0 because its upstream version is pinned. Ordinary math rendering and formatter execution were checked locally. The `devalue` 5 override is scoped to its original major so Nuxt can use its required version 6.

Nuxt 4.6.3 requires `unimport` 7.0.2 or later. The 7.0.1 override was removed to preserve that compatibility floor, but npm advertises provenance for 7.0.2 while its attestation endpoint returns HTTP 404. Registry signature verification remains a release gate; the compatible candidate is held until provenance is available or a reviewed replacement passes the same checks.

The [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249) and [glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) require new major versions. The root lock now uses `minimatch` 11.0.4 and `glob` 14.0.3. `scripts/patch-minimatch-consumers.mjs` applies SHA-bound compatibility changes to `serve-handler` 6.1.7's callable import and `eslint-plugin-import-x` 4.17.1's removed `makeRe` use after every clean install. Unexpected upstream bytes fail the install instead of silently discarding the patches. Focused regressions cover the ESM/CommonJS import rule and serve-handler's globbed headers. The clean Node 26 install, dependency and native-lock checks, both Linux ARM64 glibc and musl installs, full and production audits, lint, typecheck, source tests, build, accessibility, and browser acceptance passed. Release remains held by the separate `unimport` provenance failure above.

Full and production npm audits and registry signature/provenance verification are separate required gates. Keep all three enabled; a clean vulnerability audit does not replace provenance verification.
