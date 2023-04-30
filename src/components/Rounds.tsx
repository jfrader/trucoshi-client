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
        {rounds.map((round, i) =>
          round.map((pc) => {
            if (pc.player.key === player.key) {
              return (
                <GameCardContainer
                  key={pc.key}
                  i={i}
                  cards={player.usedHand.length}
                  open={openHand}
                >
                  <GameCard {...pc} />
                </GameCardContainer>
              );
            }
            return null;
          })
        )}
      </Box>
    </Box>
  );
};
