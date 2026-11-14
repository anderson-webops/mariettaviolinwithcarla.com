# Shared build compatibility

The application uses Node 26.13.1 and the independent locked npm 12.2.2 profile.
Its qualified provider family includes Vite 8.3.8, Rolldown 1.3.2,
Oxfmt 0.78.0, OXC parser 0.158.0, UnoCSS 66.13.0 and the reviewed schema,
Vue DevTools, Unhead, Rollup and Nitro adapters from the canonical template v2.1.28.
Every maintained package retains its original source, license, complete file
inventory and reproducible distribution. Package checks verify installed bytes,
executable modes, source corrections and all actual consumer identities.
The prebuilt Rollup injection package's source-only prepare script is denied
explicitly; acceptance checks its shipped CommonJS and ESM entrypoints.

TypeScript 7 runs strict positive and negative public-declaration checks through
the development-only `typescript-native` alias. Nuxt/Vue and the reproducible
schema compiler retain their required supported TypeScript 6 compiler API.
The recorded native 7 compiler-API incompatibility remains a separate boundary.

Eleven independent comparison/compiler graphs preserve the original publisher
contracts used by the shared regression tests. Their legacy versions are
explicit controls, independent from the application's current providers.
Full and production audits and registry signatures cover each graph.
Signature checks retain project-root edges so direct dependencies and the
single-package compiler graph receive registry verification.
The original framework graph uses immutable snapshots of the reviewed local
parents so its modules resolve within that graph. Complete source inventories,
licenses, Git blob identities and archive integrity are verified independently.
Original Nitro resolves its declared c12 3 dependency within its isolated graph;
the application uses the reviewed c12 4 adapter.
Original Unhead retains its declared DevTools kit 0.7 peer, independently of
the application's qualified DevTools host and kit 0.8 adapters.
The independent signed-source Unimport build and runtime graphs retain their
own source-build identity and qualification requirements.
The source-preserved Jiti adapter honors disabled caches for configuration
reloads and watcher recovery. The separate original loader graph retains the
native-ESM cache failure as a negative control; original c12 uses the qualified
loader so its documented uncached configuration contract remains testable.

Prepare the qualified toolchain, signed-source provider and shared fixtures
before a clean application installation. `npm test`,
`npm run test:shared-build-browser`, both dependency audits and the existing
source, native, static, accessibility and browser checks remain required.
CI and direct/Netlify preparation use the same independent fixture contracts.

The production artifact remains static `front-end/dist`. The Basin contact
flow and Carla's GitHub-main commit-only publishing process are unchanged.
Ephemeral SSR and bundler fixtures are development-only acceptance tools.

The retained Vue compiler and AST adapters still declare MagicString 0.30.
Their separate migration remains outstanding; Nitro, WASM and all four maintained
Rollup plugins resolve the qualified MagicString 1.4 provider in executable tests.
