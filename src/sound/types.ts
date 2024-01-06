import { HowlOptions } from "howler";

export interface ISoundContext {
  volume(vol: number): void;
  queue(key: string): void;
  mute(): void;
  isMuted: boolean;
}

export type ISoundQueue = Array<{ key: string; promise: () => Promise<unknown> }>;

export type IGameSounds = Record<string, HowlOptions>;
