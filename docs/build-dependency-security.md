# Guarded build dependencies

The static-site build uses the reviewed Vitesse template `v2.1.4` fixes for two unpatched transitive advisories. Root npm overrides resolve `listhen` and `braces` to local, MIT-licensed forks under `vendor/`.

- `vendor/listhen` replaces `node-forge` with `selfsigned` for temporary development TLS certificates while preserving HTTP, PEM, PFX, ESM, CommonJS, and CLI behavior. This removes the affected dependency path for [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
- `vendor/braces` bounds parser and AST-walker nesting while preserving ordinary patterns. This addresses [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

`npm test` checks both fork behavior and lockfile resolution. Retain the forks until upstream fixes pass the same tests and full and production dependency audits. The only production output remains `front-end/dist`; neither fork is included as a runtime service.

## October 2026 refresh

The project uses Node 24.22.1, the [October 21 security release](https://nodejs.org/en/blog/release/v24.22.1), and npm 12.2.1. Nuxt 4.6.3, Vite 8.3.5, Vue 3.5.44, and the refreshed root lockfile replace affected production and development dependencies. Explicit Linux native bindings match their consuming packages.

Targeted overrides retain patched `compression`, `fast-uri`, `serialize-javascript`, and `shell-quote`. The math extension uses KaTeX 0.18.2 because its upstream range still selects the affected 0.16 line; the formatter uses Tinypool 2.2.0 because its upstream version is pinned. Ordinary math rendering and formatter execution were checked locally. The `devalue` 5 override is scoped to its original major so Nuxt can use its required version 6.

Nuxt's `unimport` 7 dependency is temporarily pinned to 7.0.1 because npm advertises provenance for 7.0.2 but its attestation endpoint returns HTTP 404. The [upstream patch](https://github.com/unjs/unimport/compare/v7.0.1...v7.0.2) changes declaration-file class-export deduplication and an internal type signature; it contains no security fix. This site does not scan paired class implementation/declaration files. The 6.x dependency used by Nitro and ESLint is unchanged. Remove the pin only when a replacement passes registry signatures and provenance, both vulnerability audits, and the site's full build, type, browser, and rendering checks.

Full and production npm audits and registry signature/provenance verification are separate required gates. Keep all three enabled; a clean vulnerability audit does not replace provenance verification.
