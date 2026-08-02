# Security, identity, and system workflow audit — 2026-07-29

> Follow-up, 2026-08-02: the static-only architecture remains unchanged, but the production-container path described below has been retired. Production now uses the atomic direct host-Nginx contract in `deploy/direct/`, with exact IPv4/IPv6 identity checks and automatic rollback. Container references in this dated evidence record describe the earlier v1.4.0 gate, not the current production contract.

## Scope

This audit covered authentication, authorization, privilege promotion/demotion, lesson-request data handling, backend and system trust boundaries, dependency integrity, CI, static hosting, container execution, deployment identity, and public route behavior.

## Effective access model

| Actor | Allowed application action | Privileged state |
| --- | --- | --- |
| Public visitor | Read public studio content; submit a bounded form directly to Basin | None |
| Student or parent | Same as any public visitor | None |
| Site maintainer | Change source or promote an artifact through external GitHub/hosting controls | External control-plane role only |

There is no application identity store, login, role assignment, promotion, demotion, impersonation, password reset, session, or local authorization decision. Maintainer onboarding and offboarding belong to GitHub and the hosting provider and must not be recreated in the public site.

## Findings and remediation

### Removed dormant privileged backend

The repository contained an unused Express/Mongo/Vault workspace with an admin schema, password helper, admin-user creation path, cookie session, and account endpoint. The frontend did not call this backend. Keeping it created a privileged attack surface with no product requirement.

Remediation: removed the backend workspace, standalone lockfile, account/admin/session code, Vault client, Mongo readiness logic, and duplicated Netlify Functions. The production artifact is now static-only.

### Removed diagnostic leakage and fail-open database behavior

The retired backend and function readiness code could expose raw database/Vault errors, trusted forwarding headers for internal-route decisions, and silently fall back from configured Vault to a direct Mongo connection.

Remediation: removed the database and diagnostic boundary entirely. `/_dbinfo`, `/accounts/*`, `/admin/*`, and `/api/*` are explicit 404 routes. Static readiness declares no dependencies.

### Corrected route and deployment identity behavior

The previous wildcard hosting rewrite returned the homepage with status 200 for health, account, diagnostic, sitemap, and unknown paths. Deployment identity was unavailable.

Remediation: removed the wildcard success rewrite, added a real 404 document, added static liveness/readiness JSON, and emit exact source identity in `deployment.json` and `release.json`.

### Hardened lesson-request boundary

The hidden Basin iframe previously treated any post-submit load as confirmed delivery, provided no third-party processing notice, and did not bound submitted text.

Remediation: added explicit field limits, iframe sandboxing and referrer suppression, a Basin processing notice, cautious submitted/uncertain language, timeout handling, and direct email/phone fallback. The site still does not retain form submissions.

### Hardened browser and structured-data boundaries

The prior policy allowed broad script capabilities, and JSON-LD was serialized directly into script bodies.

Remediation: hosting policies now limit scripts and connections to the site and two analytics origins, limit forms and frames to Basin, deny framing and unused browser capabilities, and prohibit evaluation sources. JSON-LD serialization escapes script-closing and JavaScript line-separator characters.

### Hardened build, dependency, and container workflows

The previous CI mixed jobs, left end-to-end steps in the wrong job, used mutable action tags, and built an unused root-running SSR container. The npm tree was not reproducible under npm 12.

Remediation: aligned Node/npm manifests, local files, CI, Netlify, and Docker; allowlisted lifecycle scripts; explicitly locked Linux x64/ARM64 glibc/musl native packages; added clean target-platform install checks; pinned third-party actions; restored isolated browser, accessibility, CodeQL, audit, and container gates; and replaced SSR with unprivileged read-only-compatible Nginx.

## Intentional external boundaries

- Basin receives lesson-request fields.
- The dedicated Carla analytics origin receives site analytics.
- The central Jacob Anderson analytics origin receives independent site analytics.
- GitHub and the hosting provider control maintainer authorization and promotion.

The published studio address, phone, and email predated this audit and are intentional business contact content; this audit did not redefine that content decision.

## Residual operational requirements

- Hosting-provider and GitHub administrators must enforce MFA and timely maintainer removal.
- A source release is complete only after the live host reports the same commit and passes the live smoke suite.
- Private-repository GitHub job availability is not a release gate for this workspace sweep; equivalent local clean validation remains required.
- Basin and both analytics services remain third-party processors and should be periodically reviewed.

## Local validation evidence

- Exact Node `24.18.1` and npm `12.0.2`.
- Registry freshness check: no outdated workspace package.
- Clean lockfile install: successful with allowlisted lifecycle scripts and no deprecated package warning.
- Full and production-only npm audits: 0 vulnerabilities.
- Registry provenance: 1,213 verified package signatures and 381 verified attestations.
- Dependency graph: no missing or extraneous packages; the verifier accepts only two metadata-proven optional Nuxt CLI adapter peer mismatches (`cac` and `commander`) and fails on every other graph problem.
- Native dependency lock: 26 explicit Linux x64/ARM64 glibc/musl entries.
- Target installs: clean Linux ARM64 glibc and musl simulations, each confirming 7 required native packages.
- Lint and typecheck: passed.
- Automated tests: 4 frontend unit/config tests and 4 repository security/deployment tests passed.
- Static build: 40 deployment files verified with no source maps, symlinks, environment files, server bundle, or retired backend marker.
- Browser flow: 3 Cypress homepage/contact tests passed.
- Accessibility: homepage and 404 document passed WCAG A/AA axe checks in light and dark modes.
- Trivy: 0 development/production dependency vulnerabilities, 0 Dockerfile misconfigurations, and 0 source secrets.
- Gitleaks: no leaks in 236 commits or in the current source file set.

Docker and Nginx executables were not available in the local environment. The pinned container definition and Nginx policy were source-tested and scanned locally; the confined container smoke remains an independent CI/host gate rather than an unverified local claim.
