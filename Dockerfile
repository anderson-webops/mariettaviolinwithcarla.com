FROM node:20-alpine AS build-stage

WORKDIR /app
RUN corepack enable

COPY package.json package-lock.json ./
COPY back-end/package*.json ./back-end/
COPY front-end/package*.json ./front-end/
RUN npm install --ignore-scripts

COPY . .
RUN npm run build

# SSR
FROM node:20-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/front-end/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
