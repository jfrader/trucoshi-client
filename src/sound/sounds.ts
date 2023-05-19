import { IGameSounds } from "./types";

const DEFAULT_VOLUME = 0.5;
const DEFAULT_PRELOAD = true;

export const gameSounds: IGameSounds = {
  turn: {
    src: "/sounds/turn.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  round: {
    src: "/sounds/round.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  play0: {
    src: "/sounds/play_1.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  play1: {
    src: "/sounds/play_2.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  play2: {
    src: "/sounds/play_3.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
};
