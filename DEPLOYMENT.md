# Deployment

## Runtime contract

Production is only the files under `front-end/dist`, served by the existing
host-managed Nginx virtual server through
`/srv/mariettaviolinwithcarla.com/current`. The runtime has:

- zero application processes and zero Node production dependencies;
- no database, migration, queue, spool, cache, container, or writable
  application state;
- no credentials or private configuration in the archive; and
- one reviewed same-origin analytics client that sends collection requests to
  the isolated Carla analytics service.

`deploy/static-artifact.json` is the independently installed contract. Every
archive includes `runtime-manifest.json`, which inventories every path, type,
mode, size, and SHA-256 digest and binds the artifact to an exact source commit.

## Build the sealed artifact

Use Node `24.18.1` and npm `12.0.2` as an unprivileged user:

```bash
NODE_BIN_DIR=/opt/node-24.18.1/bin \
  deploy/direct/prepare-static-release.sh \
  /srv/mariettaviolinwithcarla.com/builds/<clean-checkout> \
  /srv/mariettaviolinwithcarla.com/builds
```

Preparation requires a clean complete checkout. It performs the locked
development install, full and production audits, registry-signature and
dependency/native checks, linting, type checks, unit and policy tests, static
build verification, accessibility checks, and browser acceptance with external
requests blocked. It then copies only `front-end/dist` into a temporary
staging tree, normalizes read-only modes, and emits:

- `mariettaviolinwithcarla-v<version>-<commit>-static.tar.gz`;
- a JSON packaging receipt; and
- a SHA-256 sidecar.

The artifact contains no checkout, package manager, `node_modules`, source
map, environment file, credential, or writable state. Publish the unchanged
archive and sidecar with the matching annotated source release.

## Prepare the one-time legacy rollback artifact

This step applies only while `current` still points into the pre-artifact
`/srv/mariettaviolinwithcarla.com/releases` tree. Prepare it separately from
activation:

1. Recreate or copy the exact currently serving static files into a disposable
   review tree with the layout `front-end/dist`. Do not use the live release
   path as the packer's tree.
2. Compare the review tree with the serving release and the independently
   reviewed current commit. Remove every file outside the bounded static
   contract, reject links and special files, set files to `0444`, and keep
   the review tree private to the reviewer. The packer adds the manifest before
   the tree is made read-only.
3. From the installed, root-owned helper version, run the packer as an
   unprivileged user:

   ```bash
   /usr/bin/python3 -I \
     /usr/local/libexec/marietta-violin-static-release/<version>/scripts/static-artifact.py \
     pack <review-tree> \
     --archive /srv/mariettaviolinwithcarla.com/builds/<legacy-rollback>.tar.gz \
     --commit <currently-serving-commit> \
     --allow-legacy
   ```

4. Independently inspect the resulting manifest and archive, record its
   SHA-256, and approve that exact archive/digest pair before invoking the
   promoter.

The packer marks this archive `legacy-rollback`. It cannot be installed as a
candidate release. Never generate or approve this digest inside the privileged
activation invocation, and never substitute self-declared metadata from the
live mutable release for the separate archive review.

## Bootstrap trusted helpers

The privileged boundary must never execute deployment code from a build-owned
checkout or release archive. Before the first artifact promotion for a helper
version:

1. Place the exact reviewed source release in a root-owned, non-group-writable
   review directory whose parent directories are also root protected.
2. Independently verify its tag, source commit, and published source/archive
   identity.
3. From that protected review directory, run
   `deploy/direct/install-trusted-helpers.sh` as root.

Do not run `sudo deploy/direct/*.sh` from a normal checkout. The installer
rejects mutable source trees, never overwrites an installed helper version, and
installs the reviewed promoter, artifact verifier, contract, and path guard at:

```text
/usr/local/libexec/marietta-violin-static-release/<version>/
```

It creates only the root-owned artifact, incoming, and recovery directories. It
does not change the active release, Nginx configuration, DNS, certificates, or
services. A narrow deployment wrapper may invoke the exact installed promoter;
do not grant broad sudo access.

## Promote and roll back

Invoke only the absolute installed helper and pass release metadata obtained
independently from the staged archive. Ordinary artifact-to-artifact promotions
retain the four-argument form:

```bash
sudo /usr/local/libexec/marietta-violin-static-release/<version>/deploy/direct/promote-static-release.sh \
  /srv/mariettaviolinwithcarla.com/builds/<release>.tar.gz \
  <published-sha256> \
  <candidate-commit> \
  <currently-serving-commit>
```

Use `-` for the final argument only when no `current` symlink exists. The
first transition from the legacy release root requires the separately approved
rollback archive and digest as the fifth and sixth arguments:

```bash
sudo /usr/local/libexec/marietta-violin-static-release/<version>/deploy/direct/promote-static-release.sh \
  /srv/mariettaviolinwithcarla.com/builds/<release>.tar.gz \
  <published-sha256> \
  <candidate-commit> \
  <currently-serving-commit> \
  /srv/mariettaviolinwithcarla.com/builds/<legacy-rollback>.tar.gz \
  <reviewed-legacy-sha256>
```

The helper:

1. copies untrusted staging bytes into a root-only file and authenticates that
   copy against the supplied SHA-256 and commit;
2. safely extracts only regular, bounded, inventoried static files into a new
   root-owned release and re-verifies the complete tree;
3. on the first transition, authenticates the separately reviewed legacy
   archive and SHA-256, installs its bounded regular files without traversing
   the live mutable release, and ties it to the independently supplied current
   commit;
4. writes a root-only recovery record and atomically changes `current`;
5. validates and reloads only Nginx; and
6. verifies exact release identity, security headers, method policy, and real
   missing-route behavior over local IPv4 and IPv6 TLS.

Every unsuccessful exit after mutation, including a normal interruption,
restores and verifies the sealed previous release. A failed rollback retains
the root-only recovery record and blocks later promotions for operator review.
Retained rollback trees are re-inventoried before use. Candidate releases can
never use the bounded legacy-import mode.

## Nginx

`deploy/nginx/mariettaviolinwithcarla.conf.example` preserves the installed
document root, IPv4/IPv6 listeners, host-managed certificates, method and route
policy, and security headers. It uses current `http2 on` syntax and allows the
analytics origin only for outbound collection, not executable scripts. Apply
the reviewed template through the separate host deployment process. Source
delivery does not itself change the live Nginx configuration.

## Netlify

`netlify.toml` remains an optional container-free static host for the same
`front-end/dist` bytes. It does not use the privileged direct-host helper and
adds no Functions or runtime secrets.

## Public acceptance

After separately authorized production promotion:

```bash
LIVE_SMOKE_EXPECT_COMMIT=<commit> npm run smoke:live
curl -4 --fail https://mariettaviolinwithcarla.com/release.json
curl -6 --fail https://mariettaviolinwithcarla.com/release.json
```

A source commit, tag, release, or successful artifact build is not evidence of
production activation. Record live identity separately.
