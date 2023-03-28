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
  const [rounds, isPrevious] = useRounds(match, previousHand, previousHandCallback);

  return (
    <Box maxWidth="100%" height="100%" pt="30%" pr="30%">
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
        {rounds.map((round, i) =>
          round.map((pc) => {
            if (pc.player.key === player.key) {
              return (
                <GameCardContainer
                  key={pc.key}
                  i={i}
                  cards={isPrevious ? player.prevHand.length : player.usedHand.length}
                  open={openHand}
                >
                  <GameCard {...pc} color="primary" />
                </GameCardContainer>
              );
            }
            return <span key={pc.key} />;
          })
        )}
      </Box>
    </Box>
  );
};
