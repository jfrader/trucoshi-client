import { IGameSounds } from "./types";

// This public distribution intentionally ships without audio media. Keeping an
// empty registry preserves the existing sound-hook API without making requests
// for files whose redistribution rights have not been established.
export const gameSounds = {} as const satisfies IGameSounds;
