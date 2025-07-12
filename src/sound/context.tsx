import {
  createContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
} from "react";
import { ISoundContext, ISoundQueue } from "./types";
import { Howl, HowlOptions } from "howler";
import { gameSounds } from "./sounds";

const INITIAL_QUEUE: ISoundQueue = [];

export const SoundContext = createContext<ISoundContext | null>(null);

export const SoundProvider = ({ children }: PropsWithChildren) => {
  const soundsRef = useRef<Record<string, Howl>>({});
  const soundQueueRef = useRef<ISoundQueue>(INITIAL_QUEUE);
  const isPlayingQueueSoundRef = useRef(false);
  const isLoadingRef = useRef(true);
  const readyToLoadRef = useRef(false);
  const [mainVolume, setVolume] = useState<number>(0.5);
  const [isMuted, setMuted] = useState(false);
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
          });
          howl.on("load", () => {
            resolve([key, howl] as [string, Howl]);
          });
          howl.on("loaderror", (_id, error) => {
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
        if (gameSounds[key]) {
          promises.push(load(key, gameSounds[key]));
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
        .catch(() => {
          // Silently handle errors to avoid breaking the app
        });
    }
  }, [load]);

  useEffect(() => {
    const [next] = soundQueueRef.current;
    if (next && !isPlayingQueueSoundRef.current) {
      isPlayingQueueSoundRef.current = true;
      next
        .promise()
        .then(() => {
          soundQueueRef.current = soundQueueRef.current.slice(1);
          isPlayingQueueSoundRef.current = false;
          setQueueTrigger((prev) => prev + 1);
        })
        .catch(() => {
          soundQueueRef.current = soundQueueRef.current.slice(1);
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

  const volume = useCallback(
    (vol: number) => {
      setVolume(vol);
      for (const key in soundsRef.current) {
        if (soundsRef.current[key]) {
          soundsRef.current[key].volume(isMuted ? 0 : vol);
        }
      }
    },
    [isMuted]
  );

  const queue = useCallback((key: string) => {
    readyToLoadRef.current = true;

    const sound = soundsRef.current[key];
    if (!sound) {
      return;
    }

    const promise = () =>
      new Promise((resolve, reject) => {
        isPlayingQueueSoundRef.current = true;
        sound.on("end", () => {
          resolve(undefined);
        });
        sound.on("playerror", (_id, error) => {
          reject(error);
        });
        sound.play();
      });

    soundQueueRef.current = [...soundQueueRef.current, { key, promise }];
    setQueueTrigger((prev) => prev + 1);
  }, []);

  const contextValue = useMemo(
    () => ({ queue, mute, volume, isMuted } satisfies ISoundContext),
    [queue, mute, volume, isMuted]
  );

  return <SoundContext.Provider value={contextValue}>{children}</SoundContext.Provider>;
};
