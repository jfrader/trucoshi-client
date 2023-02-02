import { Box } from "@mui/material";
import { useState } from "react";
import { IPublicMatch, IPublicPlayer } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { GameCard } from "./GameCard";

export const Rounds = ({ match, player }: { match: IPublicMatch; player: IPublicPlayer }) => {
  const [openHand, setOpenHand] = useState<boolean>(false);

  const [rounds, isPrevious] = useRounds(match);

  return (
    <Box maxWidth="100%" marginTop="74px" pr={9}>
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
                <Box
                  sx={
                    openHand
                      ? {
                          position: "absolute",
                          left: "50%",
                          right: "50%",
                          marginTop: 0,
                          marginLeft:
                            player.usedHand.length > 1 && i % 2 === 0 ? `calc((8px * ${i}) ${i === 0 ? "- 1.68" : "+ 1.2"}em)` : 0,
                        }
                      : {
                          position: "absolute",
                          left: "50%",
                          right: "50%",
                          marginTop: i !== undefined ? `calc(8px * ${i})` : 0,
                          marginLeft: i !== undefined ? `calc(8px * ${i})` : 0,
                        }
                  }
                >
                  <GameCard {...pc} color="primary" />
                </Box>
              );
            }
            return <span key={pc.key} />;
          })
        )}
      </Box>
    </Box>
  );
};
