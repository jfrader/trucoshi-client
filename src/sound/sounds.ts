import { IGameSounds } from "./types";

const DEFAULT_VOLUME = 0.5;
const DEFAULT_PRELOAD = true;

export const gameSounds: IGameSounds = {
  shuffle: {
    src: "/sounds/shuffle.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
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
  chat: {
    src: "/sounds/chat.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  deal: {
    src: "/sounds/deal.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  join: {
    src: "/sounds/join.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  leave: {
    src: "/sounds/leave.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  notification: {
    src: "/sounds/notification.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  winner: {
    src: "/sounds/winner.mp3",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  mate: {
    src: "/sounds/mate.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
  ceba_toma_mate: {
    src: "/sounds/ceba_toma_mate.wav",
    volume: DEFAULT_VOLUME,
    preload: DEFAULT_PRELOAD,
  },
};
