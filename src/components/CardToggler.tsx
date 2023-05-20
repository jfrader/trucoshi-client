import { Box, IconButton, Stack } from "@mui/material";
import { HandContainer } from "./Rounds";
import { useEffect, useState } from "react";
import { getRandomCards } from "../trucoshi/hooks/useCards";
import { ICard } from "trucoshi";
import { FlipGameCard } from "./GameCard";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { HandCardContainer } from "./HandCardContainer";

export const CardToggler = () => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [randomCards, setRandomCards] = useState<ICard[]>(getRandomCards());
  const [flip, setFlip] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setFlip(false), 750);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box height="8em" width="100%">
      <HandContainer
        sx={{ position: "relative", left: "-2.5em", pt: 3 }}
        onHandOpen={setOpenHand}
        pt={3}
      >
        {randomCards.map((card, i) => {
          return (
            <HandCardContainer key={card} open={openHand} cards={randomCards.length} i={i}>
              <FlipGameCard shadow flip={flip} zoom={openHand} card={card as ICard} />
            </HandCardContainer>
          );
        })}
        <Stack justifyContent="end" alignItems="end" position="relative" left="2em" top="-1em">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setRandomCards(getRandomCards());
            }}
            size="large"
            color="primary"
          >
            <Refresh />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setFlip((c) => !c);
            }}
            size="large"
            color="success"
          >
            {flip ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Stack>
      </HandContainer>
    </Box>
  );
};
