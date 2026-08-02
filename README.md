# Marietta Violin with Carla

Static studio and lesson-request site for [mariettaviolinwithcarla.com](https://mariettaviolinwithcarla.com).

## Architecture

- Nuxt 4 and Vue 3 generate a static site in `front-end/dist`.
- Pinia owns local content state and UnoCSS provides styling.
- The lesson-request form posts directly to Basin. This repository has no API, database, user accounts, admin role, or server-side session.
- Direct host Nginx and optional Netlify static hosting serve the same artifact; production does not require Docker.

## Supported toolchain

- Node `24.18.1`
- npm `12.0.2`

Use the exact versions in `.node-version`, `.nvmrc`, and `package.json`.

```bash
npm ci --include=optional --strict-allow-scripts
npm run dev
```

Development is available at `http://127.0.0.1:3333`.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run audit
npm run audit:production
npm run audit:signatures
npm run verify:dependency-graph
npm run verify:native-lock
npm run verify:platform-install
npm run build
npm run a11y
```

Browser tests run after a build:

```bash
npm run build
npm run -w front-end test:e2e
```

## Content and forms

Site content and contact-form limits live in `front-end/src/content/site.json`. Basin processes form submissions as a third party; the site does not store submissions itself. Keep the privacy notice and direct email/phone fallback aligned whenever the form changes.

## Operations

See `DEPLOYMENT.md`, `HEALTHCHECKS.md`, `SECURITY.md`, and the current
`docs/security-backend-workflow-audit-2026-08-02.md` audit. Every build emits
`deployment.json` and `release.json` with the exact 40-character source commit
so operators can distinguish a source release from a live promotion.
