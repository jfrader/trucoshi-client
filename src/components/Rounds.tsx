import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { GameCard, GameCardContainer } from "./GameCard";
import { PropsWithPlayer } from "../trucoshi/types";

type Props = PropsWithPlayer<{
  match: IPublicMatch;
  previousHand: IMatchPreviousHand | null;
  previousHandCallback: () => void;
}>;

export const Rounds = ({ match, previousHand, previousHandCallback, player }: Props) => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [rounds] = useRounds(match, previousHand, previousHandCallback);

  const playerCards = useMemo(
    () => rounds.flatMap((round) => round.filter((pc) => pc.player.key === player.key)),
    [player, rounds]
  );

  return (
    <Box maxWidth="100%" height="100%" pt="30%" pr="35%">
      <Box
        margin="0 auto"
        px={4}
        position="relative"
        onMouseEnter={() => {
          setOpenHand(true);
        }}
        onMouseLeave={() => {
          setOpenHand(false);
        }}
        onClick={() => {
          setOpenHand((current) => !current);
        }}
      >
        {playerCards.map((pc, i) => {
          return (
            <GameCardContainer key={pc.key} i={i} cards={playerCards.length} open={openHand}>
              <GameCard {...pc} />
            </GameCardContainer>
          );
        })}
      </Box>
    </Box>
  );
};
