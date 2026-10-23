# Repository Guidelines

Shared Sites policy (`../AGENTS.md` when available) applies. These essentials also apply in standalone checkouts:
- Never SSH, SCP, SFTP, tunnel to, or configure access to production. Do not deploy it; protected server-side automation owns activation, and source delivery alone does not prove deployment.
- GitGuardian quota, authentication, network, or service failure is not a commit/push blocker. Review outgoing changes, run another available local secret scan, preserve other hooks, and stop on real secret findings.
- Commit small, coherent, validated changes frequently as work progresses and push completed work through this repository's authorized source path, usually its default branch; use pull requests only when required.
- Group related changes into meaningful deployable milestones. Align version metadata, create a new immutable annotated semver tag, and publish its matching verified GitHub release with the required accepted artifacts.
- Complete finished deployable work through the published release consumed by protected deployment. Independently verify public release identity and acceptance read-only, or report the exact remaining blocker. Never move published tags or replace published release assets.

## Architecture and Toolchain
- This repository is intentionally a static Nuxt site. Do not add a local account system, admin role, session, API, database, Vault dependency, or serverless backend without a new documented product requirement and threat model.
- The contact form posts directly to Basin. Preserve the third-party processing notice, field limits, sandboxed target, and direct-contact fallback.
- Use Node `24.18.1` and npm `12.0.2` for local, CI, Netlify, and direct static builds.
- Treat `front-end/dist` as the only production artifact. Keep Netlify and the direct host-Nginx behavior aligned.
- Do not reintroduce a production Docker path. Preserve the atomic release symlink, automatic rollback, and exact
  IPv4/IPv6 identity checks in `deploy/direct/`.
- If hosted CI is unavailable, record that limitation and run the equivalent clean local validation; never claim CI passed or bypass branch-protection checks that actually apply.

## Release Scope
- This repo follows the stable `v1.x` line. Stay on `v1` for routine work; only cut `v2` for an intentional breaking product or deployment change.
- Static lesson content, Basin contact flow, accessibility, privacy notice, dependencies, and the static artifact contract are release-worthy when materially changed.

## Dependency & Lockfile Discipline

- Keep the root `package-lock.json` aligned with every workspace manifest. For dependency changes, review production and development packages, regenerate and include the lockfile, and run a clean root `npm ci` (not an install fallback), both audits, lint, types, and build. Security or deployment releases also need tests, native lock/install checks, and accessibility checks.
