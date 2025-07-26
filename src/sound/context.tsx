import {
  createContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
  SetStateAction,
  Dispatch,
} from "react";
import { IGameSounds, ISoundContext, ISoundQueue } from "./types";
import { Howl, HowlOptions } from "howler";
import { gameSounds } from "./sounds";

const INITIAL_QUEUE: ISoundQueue = [];

export const SoundContext = createContext<ISoundContext | null>(null);

const getStoredVolume = () => Number(localStorage.getItem("trucoshi:volume") || 0.5);

export const SoundProvider = ({ children }: PropsWithChildren) => {
  const soundsRef = useRef<Record<string, Howl>>({});
  const soundQueueRef = useRef<ISoundQueue>(INITIAL_QUEUE);
  const isPlayingQueueSoundRef = useRef<boolean | string>(false);
  const isLoadingRef = useRef(true);
  const readyToLoadRef = useRef(false);
  const [mainVolume, _setVolume] = useState<number>(getStoredVolume);
  const [isMuted, setMuted] = useState(() => !getStoredVolume());
  const [queueTrigger, setQueueTrigger] = useState(0);

  const load = useCallback(
    async (key: string, sound: HowlOptions): Promise<[string, Howl]> => {
      if (soundsRef.current[key]) {
        return Promise.resolve([key, soundsRef.current[key]]);
      }
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
    [mainVolume, isMuted]
  );

  useEffect(() => {
    if (readyToLoadRef.current && isLoadingRef.current) {
      isPlayingQueueSoundRef.current = true;
      const promises: Array<Promise<[string, Howl]>> = [];
      for (const key in gameSounds) {
        if ((gameSounds as IGameSounds)[key]) {
          promises.push(load(key, (gameSounds as IGameSounds)[key]));
        }
      }
      Promise.all(promises)
        .then((results) => {
          isPlayingQueueSoundRef.current = false;
          isLoadingRef.current = false;
          soundsRef.current = results.reduce(
            (prev, [key, howl]) => ({ ...prev, [key]: howl }),
            soundsRef.current
          );
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [load]);

  useEffect(() => {
    const [next] = soundQueueRef.current;
    if (next && !isPlayingQueueSoundRef.current) {
      const promise = next.promise();
      soundQueueRef.current = soundQueueRef.current.slice(1);
      isPlayingQueueSoundRef.current = next.key;
      promise
        .then(() => {
          isPlayingQueueSoundRef.current = false;
          setQueueTrigger((prev) => prev + 1);
        })
        .catch(() => {
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

  const setVolume: Dispatch<SetStateAction<number>> = useCallback(
    (vol) => {
      setMuted(!vol);
      _setVolume((curr) => {
        const newVol = typeof vol === "number" ? vol : vol(curr);

        localStorage.setItem("trucoshi:volume", newVol.toString());

        for (const key in soundsRef.current) {
          if (soundsRef.current[key]) {
            soundsRef.current[key].volume(newVol);
          }
        }

        return newVol;
      });
    },
    [_setVolume]
  );

  const queue = useCallback(
    (
      key: keyof typeof gameSounds | string,
      callback?: (e: Error | null, status?: "playing" | "finished") => void
    ) => {
      if (isMuted) {
        return;
      }

      readyToLoadRef.current = true;

      const sound = soundsRef.current[key];
      if (!sound) {
        callback?.(new Error("Sound not found"));
        return;
      }

      const promise = () =>
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
        });

      soundQueueRef.current = [...soundQueueRef.current, { key, promise }];
      setQueueTrigger((prev) => prev + 1);
    },
    [isMuted]
  );

  const contextValue = useMemo(
    () => ({ queue, mute, setVolume, volume: mainVolume, isMuted, isPlayingQueueSoundRef } satisfies ISoundContext),
    [queue, mute, setVolume, mainVolume, isMuted]
  );

  return <SoundContext.Provider value={contextValue}>{children}</SoundContext.Provider>;
};
