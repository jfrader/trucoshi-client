import { Howl, HowlOptions } from "howler";
import {
  useMemo,
  PropsWithChildren,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import { gameSounds } from "../sounds";
import { ISoundQueue } from "../types";
import { SoundContext } from "./context";

export const SoundProvider = ({ children }: PropsWithChildren<{}>) => {
  const [sounds, setSounds] = useState<Record<string, Howl>>({});
  const [mainVolume, setVolume] = useState<number>(0.5);
  const [isMuted, setMuted] = useState<boolean>(false);

  const load = useCallback(async (key: string, sound: HowlOptions) => {
    return new Promise<Howl>((resolve, reject) => {
      try {
        const howl = new Howl(sound);
        howl.on("load", () => {
          setSounds((current) => ({ ...current, [key]: howl }));
          resolve(howl);
        });
      } catch (e) {
        console.error("Failed to load game sound");
        reject(e);
      }
    });
  }, []);

  const get = useCallback((key: string) => sounds[key] || null, [sounds]);

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

  const [isPlayingQueueSound, setPlayingQueueSound] = useState(false);
  const [soundQueue, setQueue] = useState<ISoundQueue>([]);

  const queue = useCallback(
    (key: string) => {
      setQueue((q) => {
        if (q.find((i) => i.key === key)) {
          return q;
        }

        const sound = get(key);
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
    },
    [get]
  );

  useEffect(() => {
    const next = soundQueue.at(0);
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

  useLayoutEffect(() => {
    for (const key in gameSounds) {
      if (gameSounds[key]) {
        load(key, gameSounds[key]);
      }
    }
  }, [load]);

  const value = useMemo(
    () => ({ get, queue, load, mute, volume, isMuted }),
    [get, isMuted, load, mute, queue, volume]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};
