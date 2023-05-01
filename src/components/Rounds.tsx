import { Box } from "@mui/material";
import { useState } from "react";
import { IMatchPreviousHand, IPublicMatch, IPublicPlayer } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { GameCard, GameCardContainer } from "./GameCard";

export const Rounds = ({
  match,
  previousHand,
  previousHandCallback,
  player,
}: {
  match: IPublicMatch;
  previousHand: IMatchPreviousHand | null;
  previousHandCallback: () => void;
  player: IPublicPlayer;
}) => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [rounds] = useRounds(match, previousHand, previousHandCallback);

  const playerCards = rounds.flatMap((round) => round.filter((pc) => pc.player.key === player.key));

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
