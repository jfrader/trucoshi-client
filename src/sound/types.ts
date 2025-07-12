import { HowlOptions } from "howler";
import { Dispatch, SetStateAction } from "react";

export interface ISoundContext {
  setVolume: Dispatch<SetStateAction<number>>;
  queue(key: string): void;
  mute(): void;
  volume: number;
  isMuted: boolean;
}

export type ISoundQueue = Array<{ key: string; promise: () => Promise<unknown> }>;

export type IGameSounds = Record<string, HowlOptions>;
