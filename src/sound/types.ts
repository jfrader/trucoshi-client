import { HowlOptions } from "howler";
import { Dispatch, SetStateAction } from "react";
import { gameSounds } from "./sounds";

export interface ISoundContext {
  setVolume: Dispatch<SetStateAction<number>>;
  queue<K extends string = keyof typeof gameSounds>(
    key: K,
    callback?: (e: Error | null, status?: "playing" | "finished") => void
  ): void;
  mute(): void;
  volume: number;
  isMuted: boolean;
}

export type ISoundQueue = Array<{ key: string; promise: () => Promise<unknown> }>;

export type IGameSounds = Record<string, Omit<HowlOptions, "src"> & { src: string | string[] }>;
