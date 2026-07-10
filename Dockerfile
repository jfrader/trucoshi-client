FROM node:22.13-bookworm-slim AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

FROM deps AS build

WORKDIR /app
COPY . .

ARG VITE_APP_ENVIRONMENT_TITLE=Production
ARG VITE_APP_ENVIRONMENT=production
ARG VITE_APP_VERSION
ARG VITE_APP_NAME=trucoshi-client
ARG VITE_APP_HOST=https://trucoshi.com
ARG VITE_SENTRY_DSN
ARG VITE_LIGHTNING_ACCOUNTS_URL
ARG VITE_LIGHTNING_ACCOUNTS_COOKIE_PREFIX=
ARG VITE_ENABLE_BETS_AND_DEPOSITS=0
ARG VITE_DEBUG=0
ARG VITE_DEBUG_PROFILER_THRESHOLD=8

ENV VITE_APP_ENVIRONMENT_TITLE=${VITE_APP_ENVIRONMENT_TITLE}
ENV VITE_APP_ENVIRONMENT=${VITE_APP_ENVIRONMENT}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_HOST=${VITE_APP_HOST}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
ENV VITE_LIGHTNING_ACCOUNTS_URL=${VITE_LIGHTNING_ACCOUNTS_URL}
ENV VITE_LIGHTNING_ACCOUNTS_COOKIE_PREFIX=${VITE_LIGHTNING_ACCOUNTS_COOKIE_PREFIX}
ENV VITE_ENABLE_BETS_AND_DEPOSITS=${VITE_ENABLE_BETS_AND_DEPOSITS}
ENV VITE_DEBUG=${VITE_DEBUG}
ENV VITE_DEBUG_PROFILER_THRESHOLD=${VITE_DEBUG_PROFILER_THRESHOLD}

RUN yarn build

FROM node:22.13-bookworm-slim AS production-deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile --production

FROM node:22.13-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["./node_modules/.bin/srvx", "serve", "--dir=.", "--prod", "--static=dist/client", "--entry=dist/server/server.js"]

FROM nginx:1.27-alpine AS edge

COPY nginx/docker-ssr.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
