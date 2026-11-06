# Static artifact and deployment contract

The production application is the static `front-end/dist` tree. It has no Node
service, account system, API, database or container requirement. The existing
host-managed Nginx document root, certificates, IPv4/IPv6 listeners and automatic
GitHub-main publishing workflow remain external invariants.

## Source qualification

Use Node 26.13.0 and the independently locked npm 12.2.2 build profile.
`node scripts/build-toolchain.mjs --print-bin` prepares and qualifies its paired
commands. Local, CI, optional Netlify and direct static preparation use the same
frozen application lock and independent build-profile lock.

The unprivileged source builder is `deploy/direct/prepare-static-release.sh`.
It accepts a clean source checkout and a real empty artifact-output directory,
qualifies the build profile from the selected Node seed, and runs the existing
installation, dependency, provenance, native, lint, types, tests, browser,
accessibility and static-output gates before sealing an archive.

Netlify's automatic dependency stage is scoped to `build-toolchain`, with
lifecycle scripts disabled there. Its build command independently qualifies the
profile, performs the locked application installation with the existing
lifecycle allowlist, and generates the same static output. This changes no
owner publishing or approval step.

## Immutable artifact

`deploy/static-artifact.json` and `scripts/static-artifact.py` define the
independent required paths, bounded inventory, file modes, exact source
identity, hashes and safe unpacking rules. A release contains the sealed static
archive, its checksum, pack receipt and matching runtime manifest. Source,
development dependencies, credentials and private configuration are absent.

The reviewed, same-origin analytics client remains digest-pinned. Basin remains
the form processor, with the existing privacy notice, field limits and direct
contact fallback. No browser acceptance fixture sends real provider messages.

## Protected host acceptance

Deployment controls remain independently reviewed, root-owned and external to a
candidate. Their trusted namespace is
`/usr/local/libexec/marietta-violin-static-release/`. Candidate and retained
artifacts require independently authenticated archives, exact source identities,
safe paths and immutable runtime contents.

Promotion and rollback preserve the installed host contract, private
configuration, dual-stack TLS, readiness and exact serving identity. Recovery
records preserve interrupted or unsuccessful outcomes for protected operator
reconciliation. A legacy checkout requires a separately approved, sealed
`legacy-rollback` artifact before it can be retained rollback evidence.

A published source release does not prove protected activation or independent
external-WAN acceptance. Host operations and their authorization remain separate
from this source-side contract.
