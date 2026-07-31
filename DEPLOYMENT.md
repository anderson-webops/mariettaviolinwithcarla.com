# Deployment

## Release artifact

The canonical production artifact is `front-end/dist`, generated from the root lockfile with Node `24.18.1` and npm `12.0.2`.

```bash
npm ci --include=optional --strict-allow-scripts
npm run build
```

The build fails unless it can record an exact 40-character source commit. `deployment.json` and `release.json` must match the source commit being promoted.

## Netlify

`netlify.toml` builds the root project and publishes `front-end/dist`. It also provides static liveness/readiness rewrites, real retired-route 404s, immutable asset caching, and security headers. No Netlify Functions or runtime environment secrets are required.

## Container

Build with an explicit source identity:

```bash
docker build \
  --build-arg SOURCE_COMMIT="$(git rev-parse HEAD)" \
  --build-arg SOURCE_TAG="$(git describe --tags --exact-match 2>/dev/null || true)" \
  --tag marietta-violin:release \
  .
```

Run the image with a read-only filesystem, a small `/tmp`, no capabilities, and no privilege escalation:

```bash
docker run --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --publish 127.0.0.1:18080:8080 \
  marietta-violin:release
```

Then run `npm run smoke:deployment`.

## Promotion and rollback

1. Complete the full validation suite in `README.md`.
2. Commit and push the exact source.
3. Create the annotated semver tag and matching release.
4. Promote that commit through Netlify or the container platform.
5. Compare live `/deployment.json` with the release commit and run `LIVE_SMOKE_EXPECT_COMMIT=<commit> npm run smoke:live`.

A source tag is not proof that production was promoted. If live identity or smoke checks disagree, leave the source release intact, report promotion as pending, and roll the hosting target back to the last known-good immutable artifact. There is no database migration or application state to roll back.
