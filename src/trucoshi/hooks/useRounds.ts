import { useEffect, useState } from "react";
import { IHandPoints, IMatchPreviousHand, IPlayedCard, IPublicMatch } from "trucoshi";

export const useRounds = (
  match: IPublicMatch | null,
  previousHand: IMatchPreviousHand | null,
  callback?: () => void
): [IPlayedCard[][], IHandPoints | null, boolean] => {
  const [rounds, setRounds] = useState<IPlayedCard[][]>(match ? match.rounds : []);
  const [points, setPoints] = useState<IHandPoints | null>(null);
  const [isPrevious, setPrevious] = useState<boolean>(true);

  useEffect(() => {
    if (previousHand && match) {
      setPrevious(true);
      setPoints(previousHand.points);
      setRounds(previousHand.rounds);
      setTimeout(() => {
        setPrevious(false);
        setPoints(null);
        setRounds(match ? match.rounds : []);
        callback?.();
      }, match.options.handAckTime);
      return;
    }
    setPoints(null);
    setPrevious(false);
    setRounds(match ? match.rounds : []);
  }, [previousHand, callback, match]);

  return [rounds, points, isPrevious];
};
