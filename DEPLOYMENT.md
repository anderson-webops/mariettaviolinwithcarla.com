# Deployment

## Release artifact

The canonical production artifact is `front-end/dist`, generated from the root lockfile with Node `24.18.1` and npm `12.0.2`. There is no application server, database, or production container.

Every release is a complete Git checkout beneath `/srv/mariettaviolinwithcarla.com/releases`. The `/srv/mariettaviolinwithcarla.com/current` symlink selects the static artifact served by host Nginx.

## Prepare a direct release

Create the checkout as an unprivileged deployment user, then run:

```bash
deploy/direct/prepare-static-release.sh \
  /srv/mariettaviolinwithcarla.com/releases/<release>
```

Preparation requires a clean checkout and the exact Node/npm toolchain. It performs a clean development install, full and production dependency audits, registry signature checks, dependency-tree validation, Linux ARM64 glibc/musl install checks, linting, type checking, all tests, the static build, and accessibility checks. It confirms that `deployment.json` and `release.json` identify the candidate commit, writes an ignored preparation marker, and finishes with a clean production-only dependency install and static-output recheck.

## Host Nginx

Use `deploy/nginx/mariettaviolinwithcarla.conf.example` as the production virtual-server contract and add the certificate paths managed by the host. The configuration:

- listens on both IPv4 and IPv6;
- serves only `front-end/dist` from the active release;
- returns static JSON for `/healthz` and `/readyz`;
- returns real `404` responses for unknown, API, admin, account, and retired diagnostic routes;
- permits form and frame traffic only to Basin and script/connect traffic only to the two analytics origins; and
- rejects non-GET/HEAD requests at the edge.

Validate the completed host configuration before any reload:

```bash
sudo nginx -t
```

## Promote and roll back

Promote a prepared checkout as root:

```bash
sudo deploy/direct/promote-static-release.sh \
  /srv/mariettaviolinwithcarla.com/releases/<release>
```

Promotion atomically replaces the `current` symlink, validates and reloads Nginx, and requires exact release identity, static readiness, security headers, and real 404 behavior over local IPv4 and IPv6 TLS. If any check fails, the script restores and re-verifies the previous release. It refuses to replace a non-symlink `current` path.

## Netlify

`netlify.toml` remains a container-free static-hosting option. It builds the root project and publishes `front-end/dist`, with matching health/readiness rewrites, retired-route 404s, immutable asset caching, and security headers. No Netlify Functions or runtime secrets are required.

## Public verification

After promotion, compare the public identity with the release commit and check both authoritative address families:

```bash
LIVE_SMOKE_EXPECT_COMMIT=<commit> npm run smoke:live
curl -4 --fail https://mariettaviolinwithcarla.com/release.json
curl -6 --fail https://mariettaviolinwithcarla.com/release.json
```

A source tag is not proof of production promotion. If live identity or smoke checks disagree, leave the source release intact, report rollout as pending, and keep the last known-good static artifact active. There is no database migration or application state to roll back.
