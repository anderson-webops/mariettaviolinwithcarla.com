# Marietta Violin with Carla

Marketing site and studio contact hub for mariettaviolinwithcarla.com. This repo is a small monorepo with a Nuxt 4 front-end and a Node back-end.

## Stack

- Nuxt 4 + Vue 3
- Pinia
- UnoCSS
- Cypress (e2e)

## Repo layout

- `front-end/` - Nuxt app (static generate + preview)
- `back-end/` - API/server utilities

## Getting started

```bash
npm install
npm run dev
```

This starts the front-end in dev mode at `http://localhost:3000`.

## Common scripts

```bash
# Front-end dev
npm run dev

# Front-end dev with PWA enabled
npm run serve

# Build both packages
npm run build

# Lint + typecheck
npm run lint
npm run typecheck
```

For package-specific scripts:

```bash
npm run -w front-end dev
npm run -w front-end generate
npm run -w front-end preview
npm run -w back-end server
```

## Forms (Getform)

The contact form posts to Getform via a standard form POST (targeted to a hidden iframe to avoid navigation).

- Update the endpoint at `front-end/src/content/site.json` under `contactForm.action`.
- Form fields are configured in the same file under `contactForm.fields`.

## Tests

```bash
# Unit tests
npm run -w front-end test:unit

# Cypress (interactive)
npm run -w front-end test:e2e
```

## Deployment notes

The front-end build uses `nuxt generate` and outputs a static site at `front-end/dist`. See `netlify.toml` for hosting configuration.
