# Trucoshi Client

Web client for the Argentinian card game Truco.

It includes Default and GNU card decks plus an Emoji theme. Artwork credits
are in [ASSET_NOTICES.md](ASSET_NOTICES.md).

This release uses [`trucoshi@15.0.4`](https://www.npmjs.com/package/trucoshi).

## Setup

```sh
yarn
yarn start
```

The checked-in development defaults target the game server on port 2992. Both
`TRUCOSHI_SERVER_URL` and `VITE_APP_HOST` are game-server URLs; the Vite client
itself listens on port 2991. Its read-only admission token matches the public
server's local development default. Use `.env.local` for local overrides. The
development token must be replaced outside local development.

Node 24 and Yarn 1.22.22 are supported.

## Production

```sh
yarn build
yarn serve
```

The Node host serves `dist/` and exposes a sanitized `/admission.json` endpoint.
Set `TRUCOSHI_OPS_STATUS_TOKEN` to the server's read-only
`APP_OPS_STATUS_TOKEN`. Never expose either server credential through a `VITE_`
variable.

## Tests

```sh
yarn lint
yarn test
```

## Donations

[Donate Bitcoin](https://jfrader.com/tips)

## License

Copyright (C) 2023-2026 jfrader.

The source code is licensed under GPL-3.0-or-later. See [LICENSE](LICENSE).
Card artwork is covered by [ASSET_NOTICES.md](ASSET_NOTICES.md), and required
dependency notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
