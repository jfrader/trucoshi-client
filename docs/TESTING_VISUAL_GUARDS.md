# Visual Unit Testing Guide

This branch uses **Vitest + React Testing Library** for visual guardrails at unit level (no E2E/integration browser automation).

## What is covered

- Shared board shell rendering and seat population.
- Lobby seat states (empty seat, owner controls, readiness surfaces).
- Match bottom dock composition (announcements, hand area, command lane states).
- Command bar visual/action rendering.
- Trick center card persistence across 3 rounds.

## Determinism strategy

- Fixed viewport defaults in `src/test/setup.ts`.
- Mock heavy/remote UI dependencies where needed (avatars/cards/chat formatters).
- Use fixture builders in `src/test/fixtures/gameFixtures.ts` for stable mocked match/player data.

## Snapshot policy

- Snapshots are a guard against broad visual drift.
- Style assertions complement snapshots for high-signal properties.
- Update snapshots intentionally with `yarn test:update` only after verifying visual intent.

## Commands

- `yarn test` run suite once.
- `yarn test:watch` interactive watch mode.
- `yarn test:update` update snapshots.
- `yarn test:coverage` generate coverage report.
