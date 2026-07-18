import { useCallback, useState } from "react";

export default function useStateStorage<T extends string | null = string>(
  key: string,
  value?: T | (() => T)
): [T, (value: T | ((current: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(`trucoshi:${key}`);
    if (stored !== null) {
      return stored as T;
    }

    if (typeof value === "function") {
      return value();
    }

    return value || ("" as T);
  });

  const setter = useCallback(
    (value: T | ((current: T) => T)) => {
      setState((current) => {
        let res: T;
        if (typeof value === "function") {
          res = value(current);
        } else {
          res = value;
        }

        if (res === null) {
          localStorage.removeItem(`trucoshi:${key}`);
        } else {
          localStorage.setItem(`trucoshi:${key}`, res);
        }

        return res;
      });
    },
    [key]
  );

  return [state, setter];
}
