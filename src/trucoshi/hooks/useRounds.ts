import { useEffect, useState } from "react";
import { IPlayedCard, IPublicMatch } from "trucoshi";
import { PREVIOUS_HAND_ANIMATION_DURATION } from "../constants";

export const useRounds = (match: IPublicMatch): [IPlayedCard[][], boolean] => {
  const [rounds, setRounds] = useState<IPlayedCard[][]>(match.rounds);
  const [isPrevious, setPrevious] = useState<boolean>(true);

  useEffect(() => {
    if (match.prevRounds) {
      setPrevious(true);
      setRounds(match.prevRounds);
      setTimeout(() => {
        setPrevious(false);
        setRounds(match.rounds);
      }, PREVIOUS_HAND_ANIMATION_DURATION);
      return;
    }
    setPrevious(false);
    setRounds(match.rounds);
  }, [match.prevRounds, match.rounds]);

  return [rounds, isPrevious];
};
