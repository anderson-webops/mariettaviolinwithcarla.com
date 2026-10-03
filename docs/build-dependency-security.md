# Guarded build dependencies

The static-site build uses the reviewed Vitesse template `v2.1.4` fixes for two unpatched transitive advisories. Root npm overrides resolve `listhen` and `braces` to local, MIT-licensed forks under `vendor/`.

- `vendor/listhen` replaces `node-forge` with `selfsigned` for temporary development TLS certificates while preserving HTTP, PEM, PFX, ESM, CommonJS, and CLI behavior. This removes the affected dependency path for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
- `vendor/braces` bounds parser and AST-walker nesting while preserving ordinary patterns. This addresses [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

`npm test` checks both fork behavior and lockfile resolution. Retain the forks until upstream fixes pass the same tests and full and production dependency audits. The only production output remains `front-end/dist`; neither fork is included as a runtime service.
