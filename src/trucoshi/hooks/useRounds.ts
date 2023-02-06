import { useEffect, useState } from "react";
import { IHandPoints, IMatchPreviousHand, IPlayedCard, IPublicMatch } from "trucoshi";
import { PREVIOUS_HAND_ANIMATION_DURATION } from "../constants";

export const useRounds = (
  match: IPublicMatch | null,
  previousHand: IMatchPreviousHand | null,
  callback?: () => void
): [IPlayedCard[][], IHandPoints | null, boolean] => {
  const [rounds, setRounds] = useState<IPlayedCard[][]>(match ? match.rounds : []);
  const [points, setPoints] = useState<IHandPoints | null>(null);
  const [isPrevious, setPrevious] = useState<boolean>(true);

  useEffect(() => {
    if (previousHand) {
      setPrevious(true);
      setPoints(previousHand.points);
      setRounds(previousHand.rounds);
      setTimeout(() => {
        setPrevious(false);
        setPoints(null);
        setRounds(match ? match.rounds : []);
        callback?.();
      }, PREVIOUS_HAND_ANIMATION_DURATION);
      return;
    }
    setPoints(null);
    setPrevious(false);
    setRounds(match ? match.rounds : []);
  }, [previousHand, callback, match]);

  return [rounds, points, isPrevious];
};
