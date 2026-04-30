# UI Architecture: Shared Truco Board

This branch standardizes Match and Lobby on a single mobile-first board shell.

## Core structure

- `TrucoBoardLayout` is the shared board shell and slot renderer.
- `boardLayoutPresets` is the source of truth for geometry, viewport profiles, and seat behavior.
- `seatHandLayout` and hidden-hand helpers keep opponent hand transforms centralized.
- Match and Lobby pages orchestrate data and controls, while geometry remains in shared primitives.

## Style/token rules

- Gameplay and lobby visual constants must live in `theme.trucoshiUi`.
- Avoid adding new hardcoded board colors/gradients/borders in page-level `sx`.
- Keep repeatable UI blocks (top badges, waiting panels, dock chrome) tokenized and reusable.

## Behavioral constraints

- Do not reintroduce the old `GameTable`/`GameTableSlot` system.
- Maintain mobile-first behavior and avoid gameplay/lobby page scroll.
- Keep header/dock layout stable across turn and command state changes.
- Played cards in Match must remain visible for the full hand (up to 3 rounds per player).
