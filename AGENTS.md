# Trucoshi Client UI Context

## Current UI direction
- The old `GameTable` / `GameTableSlot` layout was removed.
- Match and Lobby now share the mobile-first board shell (`TrucoBoardLayout`).
- Keep card rendering based on existing card primitives (`GameCard` / `FlipGameCard`).

## Guardrails for future changes
- Design idea at .idea/trucoshi-mobile.png
- Do not reintroduce the legacy circular `GameTable` system.
- Prefer mobile-first behavior and avoid page scroll in gameplay/lobby surfaces.
- Keep header visible (no clipping) and avoid layout jumps on turn/command changes.
- Preserve shared visual language between Lobby and Match while allowing different controls.

## Maintainability Standards (Lobby + Match)
- Keep seat/circle geometry configurable from shared presets, not inline per-page math.
- Keep seat and hidden-hand transforms centralized in reusable helpers/components.
- Add new visual constants through theme tokens first (`theme.trucoshiUi`) before hardcoding colors/gradients.
- Prefer reusable components and styled components over large inline `sx` duplication.
- Keep layout behavior deterministic across state changes (reserve space / hide content instead of changing container size).

## Source of Truth (current)
- Board seat layout presets and viewport variants: `src/components/game/boardLayoutPresets.ts`
- Opponent hidden-hand transform math and per-seat overrides: `src/components/game/seatHandLayout.ts`
- Match seat rendering component: `src/components/game/MatchSeatCard.tsx`
- Played-cards center stack renderer: `src/components/game/TrickCenter.tsx`
- Shared board shell + slot builder: `src/components/game/TrucoBoardLayout.tsx`

## Extension Rules
- For 4/6-seat tweaks, update preset/override maps; avoid adding ad-hoc checks in `Match.tsx` / `Lobby.tsx`.
- When changing command-bar colors or board skin, update theme tokens in `src/theme.ts`.
- Keep Match and Lobby aligned through shared primitives; page files should orchestrate, not own low-level geometry.

## Match-specific requirement
- Played cards must remain visible for the full hand.
- A hand has up to 3 rounds; each player can have up to 3 played cards stacked on table.
- Do not regress to showing only the most recent round card.
