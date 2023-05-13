import { useEffect, useRef, useState } from "react";
import { IHandPoints, IMatchPreviousHand, IPlayedCard, IPublicMatch } from "trucoshi";

export const useRounds = (
  match: IPublicMatch | null,
  previousHand: IMatchPreviousHand | null,
  callback?: () => void
): [IPlayedCard[][], IHandPoints | null, boolean] => {
  const timerRef = useRef<NodeJS.Timeout>();
  const [rounds, setRounds] = useState<IPlayedCard[][]>([]);
  const [points, setPoints] = useState<IHandPoints | null>(null);
  const [isPrevious, setPrevious] = useState<boolean>(true);

  useEffect(() => {
    if (!match) {
      return setRounds([])
    }
    if (previousHand) {
      setPrevious(true);
      setPoints(previousHand.points);
      setRounds(previousHand.rounds);

      timerRef.current = setTimeout(() => {
        setPrevious(false);
        setPoints(null);
        setRounds(match.rounds);
        callback?.();
      }, match.options.handAckTime);

      return () => clearTimeout(timerRef.current);
    }

    setPoints(null);
    setPrevious(false);
    setRounds(match.rounds);
    clearTimeout(timerRef.current);
  }, [previousHand, callback, match]);

  return [rounds, points, isPrevious];
};
