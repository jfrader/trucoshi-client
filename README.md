# Trucoshi Client

The Trucoshi web client is a server-rendered React application built with
[TanStack Start](https://tanstack.com/start), TanStack Router, Material UI, and Emotion.

## Development

Copy `.env.example` to `.env`, adjust the backend URLs, then install and run:

```sh
yarn install
yarn dev
```

The development server listens on `http://localhost:2991` by default.

## Verification

```sh
yarn typecheck
yarn lint
yarn test
yarn build
```

`yarn build` produces the browser bundle in `dist/client` and the SSR handler in
`dist/server`. Run the production output with:

```sh
yarn start
```

## Docker deployment

The deployment has two containers: `trucoshi-client` is the private Node SSR
process and `trucoshi-edge` is nginx. The edge serves `dist/client` directly,
caches fingerprinted files, and forwards dynamic requests to SSR. The server's
host nginx remains responsible only for TLS/Certbot and forwarding a hostname
to the edge's loopback port.

All `VITE_*` settings are build-time public client configuration. Keep each
environment in its own ignored Compose env file and rebuild whenever one
changes. Do not put credentials in a `VITE_*` setting.

```sh
# Production: HOST_PORT=3000 in .env.production
docker compose -p trucoshi-prod --env-file .env.production up -d --build --wait

# Staging: HOST_PORT=3001 in .env.staging
docker compose -p trucoshi-staging --env-file .env.staging up -d --build --wait
```

Use separate checkout directories for production and staging. The host nginx
references are `nginx/trucoshi-ssr.conf` (production, port 3000) and
`nginx/testnet-trucoshi-ssr.conf` (staging, port 3001). Staging must use its own
game and accounts URLs; never point its public configuration at production
services. The staging host config also sends `X-Robots-Tag: noindex, nofollow,
noarchive` on every response and overrides `/robots.txt` with a full disallow.

## Application structure

- `src/routes`: file-based TanStack routes, route metadata, redirects, and HTTP handlers.
- `src/router.tsx`: the native TanStack Router instance used by Start.
- `src/seo`: canonical metadata and structured-data definitions.
- `src/components`, `src/pages`, `src/trucoshi`: application UI and game behavior.
- `public`: immutable public assets, robots policy, and sitemap.

Material UI follows the official TanStack Start SSR integration. The local `trucoshi`
package is transformed by Vite during SSR because its published ESM uses extensionless
internal imports.
