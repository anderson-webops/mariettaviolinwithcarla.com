# Health checks

This is a static site with no database or application server.

- `GET /healthz` returns static JSON with `status: "ok"`.
- `GET /readyz` returns static JSON with `status: "ready"` and an empty dependency list.
- `GET /deployment.json` identifies the exact source commit, release reference, runtime, service, and package version.
- `GET /release.json` mirrors deployment identity for release tooling.

Health and identity responses are non-secret, require no authentication, and must use `Cache-Control: no-store`. Application, account, admin, API, and database-diagnostic routes are retired and must return `404`, not the homepage.

Use `/healthz` for liveness, `/readyz` for static readiness, and `/deployment.json` to verify promotion. Do not use `/` as the only deployment identity check.
