import { useCallback, useEffect, useState } from "react";

const getStorage = () =>
  typeof window !== "undefined" && window.localStorage ? window.localStorage : null;

export default function useStateStorage<T extends string | null = string>(
  key: string,
  value?: T | (() => T),
): [T, (value: T | ((current: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof value === "function") {
      return value();
    }

    return value ?? ("" as T);
  });

  useEffect(() => {
    const stored = getStorage()?.getItem(`trucoshi:${key}`);
    if (stored !== null && stored !== undefined) {
      setState(stored as T);
    }
  }, [key]);

  const setter = useCallback(
    (value: T | ((current: T) => T)) => {
      setState((current) => {
        let res: T;
        if (typeof value === "function") {
          res = value(current);
        } else {
          res = value;
        }

        const storage = getStorage();

        if (storage) {
          if (res === null) {
            storage.removeItem(`trucoshi:${key}`);
          } else {
            storage.setItem(`trucoshi:${key}`, res);
          }
        }

        return res;
      });
    },
    [key],
  );

  return [state, setter];
}
