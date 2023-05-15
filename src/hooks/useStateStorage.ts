import { useCallback, useState } from "react";

export default function useStateStorage<T extends string = string>(
  key: string,
  value?: T
): [T, (value: T) => T] {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(`trucoshi:${key}`);
    if (stored !== null) {
      return stored as T;
    }

    return value || ("" as T);
  });

  const setter = useCallback(
    (value: T) => {
      localStorage.setItem(`trucoshi:${key}`, value);
      setState(value);
      return value;
    },
    [key]
  );

  return [state, setter];
}
