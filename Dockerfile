FROM node:20-alpine AS build-stage

WORKDIR /app
RUN corepack enable

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY back-end/package.json ./back-end/
COPY front-end/package.json ./front-end/
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# SSR
FROM node:20-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/front-end/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
