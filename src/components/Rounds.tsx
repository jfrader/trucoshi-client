import { Box } from "@mui/material";
import { useState } from "react";
import { IPublicMatch, IPublicPlayer } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { GameCard, GameCardContainer } from "./GameCard";

export const Rounds = ({ match, player }: { match: IPublicMatch; player: IPublicPlayer }) => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [rounds, isPrevious] = useRounds(match);

  return (
    <Box maxWidth="100%" height="100%" marginTop="2em" pr={9}>
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
            if (
              player.usedHand.includes(pc.card) ||
              (isPrevious && player.prevHand.includes(pc.card))
            ) {
              return (
                <GameCardContainer
                  key={pc.key}
                  i={i}
                  cards={player.usedHand.length}
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
