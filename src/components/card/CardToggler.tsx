import { Box, BoxProps, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { getRandomCards } from "../../trucoshi/hooks/useCards";
import { ICard } from "trucoshi";
import { FlipGameCard } from "./GameCard";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { HandCardContainer } from "./HandCardContainer";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

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
    <Box pt={3} height="8em" sx={{ position: "relative" }} {...props}>
      <Box position="relative" right={25}>
        {randomCards.map((card, i) => {
          return (
            <HandCardContainer key={card} open cards={randomCards.length} i={i}>
              <FlipGameCard shadow flip={flip} zoom card={card as ICard} />
            </HandCardContainer>
          );
        })}
      </Box>
      <Stack justifyContent="end" alignItems="end" position="absolute" right="0">
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
  );
};
