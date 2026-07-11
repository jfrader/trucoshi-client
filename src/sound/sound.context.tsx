import {
  createContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { ISoundContext, ISoundQueue } from "./types";
import type { Howl, HowlOptions } from "howler";
import { gameSounds } from "./sounds";

const INITIAL_QUEUE: ISoundQueue = [];
const MAX_QUEUE_LENGTH = 4;
const QUEUE_TIMEOUT = 5000;
const SOUND_EXPIRY_TIMEOUT = 5000;

export const SoundContext = createContext<ISoundContext | null>(null);

const getStorage = () =>
  typeof window !== "undefined" && window.localStorage ? window.localStorage : null;

const DEFAULT_VOLUME = 0.5;

const getStoredVolume = () => Number(getStorage()?.getItem("trucoshi:volume") || DEFAULT_VOLUME);

export const SoundProvider = ({ children }: PropsWithChildren) => {
  const soundsRef = useRef<Record<string, Howl>>({});
  const loadingSoundsRef = useRef<Record<string, Promise<Howl>>>({});
  const soundQueueRef = useRef<ISoundQueue>(INITIAL_QUEUE);
  const isPlayingQueueSoundRef = useRef<boolean | string>(false);
  const [mainVolume, _setVolume] = useState(DEFAULT_VOLUME);
  const [isMuted, setMuted] = useState(false);
  const [queueTrigger, setQueueTrigger] = useState(0);

  useEffect(() => {
    const storedVolume = getStoredVolume();
    _setVolume(storedVolume);
    setMuted(!storedVolume);
  }, []);

  const load = useCallback(
    async (key: string, sound: HowlOptions): Promise<[string, Howl]> => {
      if (soundsRef.current[key]) {
        return Promise.resolve([key, soundsRef.current[key]]);
      }

      const { Howl } = await import("howler");

      return new Promise<[string, Howl]>((resolve, reject) => {
        try {
          const howl = new Howl({
            ...sound,
            volume: isMuted ? 0 : mainVolume,
            autoplay: false,
          });

          if (!sound.preload) {
            resolve([key, howl] as [string, Howl]);
            return;
          }

          howl.once("load", () => {
            resolve([key, howl] as [string, Howl]);
          });
          howl.once("loaderror", (_id, error) => {
            reject(error);
          });
        } catch (e) {
          reject(e);
        }
      });
    },
    [mainVolume, isMuted],
  );

  const getSound = useCallback(
    (key: string) => {
      const loadedSound = soundsRef.current[key];
      if (loadedSound) {
        return Promise.resolve(loadedSound);
      }

      const loadingSound = loadingSoundsRef.current[key];
      if (loadingSound) {
        return loadingSound;
      }

      const soundConfig = gameSounds[key as keyof typeof gameSounds];
      if (!soundConfig) {
        return Promise.reject(new Error(`Sound not found: ${key}`));
      }

      const soundPromise = load(key, soundConfig)
        .then(([, sound]) => {
          soundsRef.current[key] = sound;
          return sound;
        })
        .finally(() => {
          delete loadingSoundsRef.current[key];
        });

      loadingSoundsRef.current[key] = soundPromise;
      return soundPromise;
    },
    [load],
  );

  useEffect(() => {
    const [next] = soundQueueRef.current;
    if (next && !isPlayingQueueSoundRef.current) {
      const now = Date.now();
      if (now - next.queuedAt > SOUND_EXPIRY_TIMEOUT) {
        soundQueueRef.current = soundQueueRef.current.slice(1);
        setQueueTrigger((prev) => prev + 1);
        next.callback?.(new Error("Sound expired"));
        return;
      }

      const promise = next.promise();
      soundQueueRef.current = soundQueueRef.current.slice(1);
      isPlayingQueueSoundRef.current = next.key;

      const timeoutId = setTimeout(() => {
        isPlayingQueueSoundRef.current = false;
        setQueueTrigger((prev) => prev + 1);
      }, QUEUE_TIMEOUT);

      promise
        .then(() => {
          clearTimeout(timeoutId);
          isPlayingQueueSoundRef.current = false;
          setQueueTrigger((prev) => prev + 1);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          isPlayingQueueSoundRef.current = false;
          setQueueTrigger((prev) => prev + 1);
        });
    }
  }, [queueTrigger]);

  const mute = useCallback(() => {
    setMuted((current) => {
      const newMuted = !current;
      for (const key in soundsRef.current) {
        if (soundsRef.current[key]) {
          soundsRef.current[key].volume(newMuted ? 0 : mainVolume);
        }
      }
      return newMuted;
    });
  }, [mainVolume]);

  const setVolume: Dispatch<SetStateAction<number>> = useCallback((vol) => {
    setMuted(!vol);
    _setVolume((curr) => {
      const newVol = typeof vol === "number" ? vol : vol(curr);
      getStorage()?.setItem("trucoshi:volume", newVol.toFixed(2).toString());
      for (const key in soundsRef.current) {
        if (soundsRef.current[key]) {
          soundsRef.current[key].volume(newVol);
        }
      }
      return newVol;
    });
  }, []);

  const queue = useCallback(
    (
      key: keyof typeof gameSounds | string,
      callback?: (e: Error | null, status?: "playing" | "finished") => void,
    ) => {
      if (isMuted) {
        callback?.(new Error("Muted"));
        return;
      }

      if (soundQueueRef.current.some((item) => item.key === key)) {
        callback?.(new Error("Sound already in queue"));
        return;
      }

      if (soundQueueRef.current.length >= MAX_QUEUE_LENGTH) {
        soundQueueRef.current = soundQueueRef.current.slice(1);
      }

      const promise = () =>
        getSound(key)
          .catch((error: unknown) => {
            const soundError = error instanceof Error ? error : new Error("Sound load error");
            callback?.(soundError);
            throw soundError;
          })
          .then(
            (sound) =>
              new Promise((resolve, reject) => {
                isPlayingQueueSoundRef.current = key;
                sound.once("end", () => {
                  callback?.(null, "finished");
                  resolve(undefined);
                });
                sound.once("playerror", (_id, error) => {
                  callback?.(new Error("Play error"));
                  reject(error);
                });
                callback?.(null, "playing");
                sound.play();
              }),
          );

      soundQueueRef.current = [
        ...soundQueueRef.current,
        { key, promise, callback, queuedAt: Date.now() },
      ];
      setQueueTrigger((prev) => prev + 1);
    },
    [getSound, isMuted],
  );

  const contextValue = useMemo(
    () =>
      ({
        queue,
        mute,
        setVolume,
        volume: mainVolume,
        isMuted,
        isPlayingQueueSoundRef,
      }) satisfies ISoundContext,
    [queue, mute, setVolume, mainVolume, isMuted],
  );

  return <SoundContext.Provider value={contextValue}>{children}</SoundContext.Provider>;
};
