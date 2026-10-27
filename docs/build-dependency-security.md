# Guarded build dependencies

The static-site build uses the reviewed Vitesse template `v2.1.4` fixes for two unpatched transitive advisories. Root npm overrides resolve `listhen` and `braces` to local, MIT-licensed forks under `vendor/`.

- `vendor/listhen` replaces `node-forge` with `selfsigned` for temporary development TLS certificates while preserving HTTP, PEM, PFX, ESM, CommonJS, and CLI behavior. This removes the affected dependency path for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
- `vendor/braces` bounds parser and AST-walker nesting while preserving ordinary patterns. This addresses [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

`npm test` checks both fork behavior and lockfile resolution. Retain the forks until upstream fixes pass the same tests and full and production dependency audits. The only production output remains `front-end/dist`; neither fork is included as a runtime service.

## October 2026 refresh

The project uses Node 24.22.1, the [October 21 security release](https://nodejs.org/en/blog/release/v24.22.1), and npm 12.2.1. Nuxt 4.6.3, Vite 8.3.5, Vue 3.5.44, and the refreshed root lockfile replace affected production and development dependencies. Explicit Linux native bindings match their consuming packages.

Targeted overrides retain patched `compression`, `fast-uri`, `serialize-javascript`, and `shell-quote`. The math extension uses KaTeX 0.18.2 because its upstream range still selects the affected 0.16 line; the formatter uses Tinypool 2.2.0 because its upstream version is pinned. Ordinary math rendering and formatter execution were checked locally. The `devalue` 5 override is scoped to its original major so Nuxt can use its required version 6.

Full and production npm audits report zero known vulnerabilities. Registry provenance verification remains a separate required gate: on October 27, npm advertised an attestation for `unimport@7.0.2` but returned HTTP 404 at that endpoint. A vulnerability audit does not substitute for this check, and the gate remains enabled.
