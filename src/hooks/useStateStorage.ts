import { useCallback, useState } from "react";

export default function useStateStorage(
  key: string,
  value?: string
): [string | null, (value: string) => string] {
  const [state, setState] = useState(() => value || localStorage.getItem(`trucoshi:${key}`));

  const setter = useCallback(
    (value: string) => {
      localStorage.setItem(`trucoshi:${key}`, value as string);
      setState(value);
      return value;
    },
    [key]
  );

  return [state, setter];
}
