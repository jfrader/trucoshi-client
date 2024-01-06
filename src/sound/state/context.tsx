import { createContext } from "react";
import { ISoundContext } from "../types";
import { Howl, HowlOptions } from "howler";
import { PropsWithChildren, useState, useCallback, useEffect } from "react";
import { gameSounds } from "../sounds";
import { ISoundQueue } from "../types";
import { useDebouncedCallback } from "use-debounce";

const INITIAL_QUEUE: ISoundQueue = [];

export const SoundContext = createContext<ISoundContext | null>(null);

export const SoundProvider = ({ children }: PropsWithChildren<{}>) => {
  const [sounds, setSounds] = useState<Record<string, Howl>>({});
  const [mainVolume, setVolume] = useState<number>(0.5);
  const [isPlayingQueueSound, setPlayingQueueSound] = useState(false);
  const [soundQueue, setQueue] = useState<ISoundQueue>(INITIAL_QUEUE);
  const [isMuted, setMuted] = useState(false);
  const [readyToLoad, setReadyToLoad] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const _load = useCallback(
    async (key: string, sound: HowlOptions): Promise<[string, Howl]> => {
      if (sounds[key]) {
        return Promise.resolve([key, sounds[key]]);
      }
      return new Promise<[string, Howl]>((resolve, reject) => {
        try {
          const howl = new Howl(sound);
          howl.on("load", () => {
            resolve([key, howl] as [string, Howl]);
          });
        } catch (e) {
          console.error("Failed to load game sound");
          reject(e);
        }
      });
    },
    [sounds]
  );

  useEffect(() => {
    const [next] = soundQueue;
    if (next && !isPlayingQueueSound) {
      next.promise().then(() => {
        setQueue((current) => {
          const newQueue = [...current];
          newQueue.shift();
          return newQueue;
        });
        setPlayingQueueSound(false);
      });
    }
  }, [isPlayingQueueSound, soundQueue]);

  useEffect(() => {
    if (readyToLoad && isLoading) {
      setPlayingQueueSound(true);
      const promises: Array<Promise<[string, Howl]>> = [];
      for (const key in gameSounds) {
        if (gameSounds[key]) {
          promises.push(_load(key, gameSounds[key]));
        }
      }
      Promise.all(promises)
        .then((results) => {
          setPlayingQueueSound(false);
          setLoading(false);
          setSounds((current) =>
            results.reduce((prev, [key, howl]) => ({ ...prev, [key]: howl }), current)
          );
        })
        .catch((e) => {
          console.error(e);
          console.error("Failed to load sounds");
        });
    }
  }, [isLoading, _load, readyToLoad]);

  const mute = useCallback(() => {
    setMuted((current) => {
      for (const key in sounds) {
        if (sounds[key]) {
          if (current) {
            sounds[key].volume(mainVolume);
          } else {
            sounds[key].volume(0);
          }
        }
      }
      return !current;
    });
  }, [mainVolume, sounds]);

  const volume = useCallback(
    (vol: number) => {
      setVolume(vol);
      for (const key in sounds) {
        if (sounds[key]) {
          sounds[key].volume(vol);
        }
      }
    },
    [sounds]
  );

  const queue = useDebouncedCallback((key: string) => {
    setReadyToLoad(true);
    setQueue((q) => {
      if (q.find((i) => i.key === key)) {
        return q;
      }

      const sound = sounds[key];
      if (!sound) {
        return q;
      }

      const promise = () =>
        new Promise((resolve) => {
          setPlayingQueueSound(true);
          sound.on("end", resolve);
          sound.play();
        });

      return [...q, { key, promise }];
    });
  }, 300);

  return (
    <SoundContext.Provider value={{ queue, mute, volume, isMuted } satisfies ISoundContext}>
      {children}
    </SoundContext.Provider>
  );
};
