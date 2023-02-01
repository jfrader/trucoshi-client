import { useEffect, useState } from "react";
import { IPlayedCard } from "trucoshi/dist/lib/types";
import { IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";

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
      }, 4500);
      return;
    }
    setPrevious(false);
    setRounds(match.rounds);
  }, [match.prevRounds, match.rounds]);

  return [rounds, isPrevious];
};
