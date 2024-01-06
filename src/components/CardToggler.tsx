import { Box, BoxProps, IconButton, Stack } from "@mui/material";
import { HandContainer } from "./Rounds";
import { useEffect, useState } from "react";
import { getRandomCards } from "../trucoshi/hooks/useCards";
import { ICard } from "trucoshi";
import { FlipGameCard } from "./GameCard";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { HandCardContainer } from "./HandCardContainer";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const CardToggler = (props: BoxProps) => {
  const [{ cardTheme }] = useTrucoshi();
  const [randomCards, setRandomCards] = useState<ICard[]>(getRandomCards());
  const [flip, setFlip] = useState(true);

  useEffect(() => {
    setFlip(true);
    const timeout = setTimeout(() => setFlip(false), 750);
    return () => clearTimeout(timeout);
  }, [cardTheme]);

  return (
    <Box height="8em" {...props}>
      <Box sx={{ position: "relative", left: "-2.5em", pt: 3 }} pt={3}>
        {randomCards.map((card, i) => {
          return (
            <HandCardContainer key={card} open cards={randomCards.length} i={i}>
              <FlipGameCard shadow flip={flip} zoom card={card as ICard} />
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
      </Box>
    </Box>
  );
};
