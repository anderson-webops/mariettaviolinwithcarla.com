FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS build-stage

WORKDIR /app
ENV CYPRESS_INSTALL_BINARY=0 \
    NUXT_TELEMETRY_DISABLED=1 \
    PUPPETEER_SKIP_DOWNLOAD=true

RUN npm install --global npm@12.0.2

COPY .npmrc package.json package-lock.json ./
COPY front-end/package.json front-end/package.json
RUN --mount=type=cache,id=marietta-violin-npm-cache,target=/root/.npm \
	npm ci --include=optional --strict-allow-scripts \
	&& npm cache clean --force

COPY . .
ARG SOURCE_COMMIT
ARG SOURCE_TAG=""
ENV SOURCE_COMMIT=${SOURCE_COMMIT} \
    SOURCE_TAG=${SOURCE_TAG}
RUN test -n "${SOURCE_COMMIT}" && npm run build

FROM nginx:stable-alpine@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46 AS production-stage

COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage --chown=101:101 /app/front-end/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD ["wget", "--quiet", "--spider", "http://127.0.0.1:8080/healthz"]

CMD ["nginx", "-g", "daemon off;"]
