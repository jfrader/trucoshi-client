# Trucoshi Client UI Context

## Current UI direction
- The old `GameTable` / `GameTableSlot` layout was removed.
- Match and Lobby now share the mobile-first board shell (`TrucoBoardLayout`).
- Keep card rendering based on existing card primitives (`GameCard` / `FlipGameCard`).

## Guardrails for future changes
- Do not reintroduce the legacy circular `GameTable` system.
- Prefer mobile-first behavior and avoid page scroll in gameplay/lobby surfaces.
- Keep header visible (no clipping) and avoid layout jumps on turn/command changes.
- Preserve shared visual language between Lobby and Match while allowing different controls.

## Match-specific requirement
- Played cards must remain visible for the full hand.
- A hand has up to 3 rounds; each player can have up to 3 played cards stacked on table.
- Do not regress to showing only the most recent round card.
