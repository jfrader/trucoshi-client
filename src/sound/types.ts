import { HowlOptions } from "howler";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
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
  isPlayingQueueSoundRef: MutableRefObject<string | boolean>;
}

export type ISoundQueue = Array<{
  key: string;
  promise: () => Promise<unknown>;
  callback?: (e: Error | null, status?: "playing" | "finished") => void;
  queuedAt: number;
}>;

export type IGameSounds = Record<string, Omit<HowlOptions, "src"> & { src: string | string[] }>;
