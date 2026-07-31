# Security

## Identity and authorization

Marietta Violin with Carla is a static public website. It has no registration, login, local account, privileged application role, admin route, password, session, promotion, or demotion workflow. Visitors may read public content and submit the third-party lesson-request form; no visitor can acquire application privileges because the application has none.

Deployment authority exists only in the external source-control and hosting systems. Those systems should enforce multi-factor authentication, least-privilege collaborator access, protected release credentials, and prompt removal of former maintainers.

## Data handling

The lesson-request form submits directly to Basin over HTTPS. Basin, not this site, processes the submitted name, email, and message. Fields have explicit length limits, the page discloses this third-party processing, and a direct email/phone fallback is provided. Do not add sensitive student, payment, medical, or account information to the form.

The site also loads privacy-separated analytics from:

- `analytics.mariettaviolinwithcarla.com`
- `analytics.jacobdanderson.net`

These origins and Basin are the only intentional production third-party network boundaries.

## Runtime protections

- Static generation removes database, Vault, session, and server-side account attack surfaces.
- Unknown, API, admin, account, and retired database-diagnostic routes return `404`.
- The container runs Nginx as an unprivileged user on port 8080 and supports a read-only filesystem, dropped capabilities, and `no-new-privileges`.
- Security headers restrict framing, forms, scripts, connections, browser capabilities, referrers, MIME sniffing, and transport downgrade.
- Deployment metadata contains source identity only and never contains secrets.
- npm lifecycle scripts are allowlisted and Linux ARM64 glibc/musl native packages are explicitly locked and tested.

## Reporting a vulnerability

Do not include secrets, personal lesson-request data, or exploit details in a public issue. Use the repository host's private security-reporting channel or contact the repository owner privately. Include the affected URL or commit, impact, reproducible steps, and any safe mitigation.
