# Security, identity, and system workflow audit — 2026-08-02

## Outcome

The site remains intentionally static and has no application authentication,
account, role, session, database, API, or administrative workflow. The only
privileged actions are source-control administration and promotion of a
prepared static release. No application promotion or demotion path exists to
abuse.

The audit found one remaining system-level discrepancy: production deployment
still treated a Docker/Nginx image as the primary release path even though the
site has no runtime process. That path and its CI/Dependabot surface have been
retired. Production is now a direct host-Nginx static release with an atomic
symlink, exact source identity checks over IPv4 and IPv6, and automatic
rollback.

## Access and authorization model

| Actor | Allowed action | Privileged application state |
| --- | --- | --- |
| Visitor, student, or parent | Read public content and submit the bounded Basin form | None |
| Maintainer | Change source through the repository host | External control-plane role only |
| Deployment operator | Prepare and promote a validated static checkout | Host privilege only; no application role |

There is no registration, login, password reset, cookie session, token,
impersonation, role grant, role removal, admin route, or local identity store.
Maintainer promotion and demotion therefore belong exclusively to the
repository and host control planes. Those systems must enforce MFA,
least-privilege access, protected credentials, and prompt collaborator removal.

## Data and trust boundaries

- Lesson-request fields are length-bounded and post directly over HTTPS to
  Basin. The site does not receive, store, or log submissions.
- The form discloses third-party processing, uses a sandboxed target, reports
  submission success cautiously, and retains direct email/phone fallbacks.
- Browser analytics are limited to
  `analytics.mariettaviolinwithcarla.com` and
  `analytics.jacobdanderson.net`.
- The generated deployment metadata contains only public release identity.
- API, account, admin, database-diagnostic, hidden-file, and unknown routes
  return real `404` responses. Non-GET/HEAD requests return `405` at the edge.

## Release authority and rollback

Release preparation must run as an unprivileged user against a clean checkout
beneath the configured release root. It requires Node `24.18.1` and npm
`12.0.2`, runs all dependency and source gates, verifies that generated release
identity equals the candidate commit, and leaves a matching preparation marker.

Promotion must run as root because it changes the host's active symlink and
reloads Nginx. It refuses an unprepared candidate, an out-of-root path, a
non-symlink active path, or mismatched release metadata. After atomic
activation it requires exact release identity, readiness, security headers,
and real missing-route behavior over local IPv4 and IPv6 TLS. Any failure
restores and re-verifies the prior release.

## Dependency and supply-chain result

- Clean development install: 1,213 packages installed and 1,216 audited, with
  zero vulnerabilities.
- Production-only install: 33 packages installed and 35 audited, with zero
  vulnerabilities.
- Registry provenance: 1,213 verified signatures and 381 attestations.
- Dependency graph: clean except for two explicitly validated optional Nuxt CLI
  peer-metadata mismatches.
- Native lock: 26 explicit Linux x64/ARM64 glibc/musl entries.
- Linux ARM64 simulations: both glibc and musl clean installs found all seven
  required native packages.
- Current compatible updates applied: Carbon icons `1.2.25`, Rollup `4.62.4`,
  and `vue-tsc` `3.3.9`. Node 26 type declarations, TypeScript 7, and
  graph-matched oxc/oxfmt native packages remain deliberately held to the
  supported Node 24 and current dependency graph.

## Validation evidence

- Lint and type checking passed.
- Four frontend tests and four repository security/deployment tests passed.
- The static build produced and verified 40 files with no source maps,
  symlinks, environment files, server bundle, or retired-backend markers.
- Three Cypress booking/contact browser tests passed.
- Homepage and 404 document passed WCAG A/AA checks in light and dark modes.
- Gitleaks found no leaks across 242 commits or the current source set.
- Trivy found zero high/critical dependency vulnerabilities, source secrets,
  or configuration findings.
- Full and production-only npm audits each reported zero vulnerabilities.

The direct Nginx configuration and promotion scripts are source-tested locally.
A source release is not a completed production rollout until the public host
reports the same commit and passes the live smoke checks over both address
families.
