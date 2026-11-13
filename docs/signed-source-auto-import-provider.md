# Signed-source auto-import provider

Nuxt keeps its original `unimport ^7.0.2` requirement. The installed provider is
the compatible `7.0.2+webops.2` build already qualified in the owned canonical
template. Its original source, signed Git tag and commit, pinned public signer,
upstream manifest and license remain preserved. The registry's advertised
7.0.2 attestation returned HTTP 404; this build establishes its own independently
verified source provenance rather than claiming that missing attestation passed.

The maintained source preserves public entrypoints and repairs project-relative
package discovery, optional Acorn resolution and VueUse preset discovery. Its
independent build and production-only fixture graphs use current compatible
providers, with separate lockfiles, full/production audits and registry signature
checks for their external dependencies.

Select the independently locked build profile, then prepare the source provider:

```sh
export PATH="$(node scripts/build-toolchain.mjs --print-bin):$PATH"
npm run prepare:unimport-source
npm ci --include=optional --strict-allow-scripts
npm run audit
npm run audit:production
npm run audit:signatures
```

Preparation verifies the original signed objects and complete source inventory,
builds in two fresh source directories, runs upstream tests/types/lint and
requires byte-for-byte reproduction of the checked-in archive. Installed-byte
verification and sterile runtime fixtures retain entrypoint, transform, package
discovery and dependency-failure coverage. Mutated source/signatures/archives and
missing or substituted runtime files remain rejecting cases.

CI prepares the provider before every app installation. The maintained Netlify
command selects the same qualified profile and runs `build-reviewed-static.sh`.
Carla's publishing action remains committing content changes to GitHub main.
The resulting production artifact remains static files only, without a Node
service, package manager, database, account system or writable application state.

Shared build modules retain their canonical source formatting under narrowly
scoped formatting rules. All other lint, security, content, audit, native and
artifact acceptance rules remain enabled. The static site's compiler fixture
tests its actual frontend compiler; it does not claim a nonexistent backend.
