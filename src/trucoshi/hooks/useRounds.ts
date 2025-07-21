import { IHandPoints, IPlayedCard, IPublicMatch } from "trucoshi";

export const useRounds = (
  match: IPublicMatch | null
): [IPlayedCard[][], IHandPoints | undefined, boolean] => {
  if (!match) return [[], undefined, false];

  return [
    match.previousHand ? match.previousHand.rounds : match.rounds,
    match.previousHand?.points,
    !!match.previousHand,
  ];
};
