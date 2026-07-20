import { Box, CircularProgress, type BoxProps } from "@mui/material";
import { useEffect, useState } from "react";
import { CARDS, type ICard } from "trucoshi";
import { FlipGameCard } from "../components/card/GameCard";

const PROGRESS_CARDS = Object.keys(CARDS) as ICard[];
const INITIAL_CARD = PROGRESS_CARDS[0];
const FLIP_INTERVAL_MS = 850;

const getNextProgressCard = (currentCard: ICard) => {
  const currentIndex = PROGRESS_CARDS.indexOf(currentCard);
  return PROGRESS_CARDS[(Math.max(currentIndex, 0) + 7) % PROGRESS_CARDS.length];
};

type TrucoshiProgressProps = BoxProps & { width?: string };

export const TrucoshiProgress = ({ width = "4rem", sx, ...props }: TrucoshiProgressProps) => {
  const [card, setCard] = useState<ICard>(INITIAL_CARD);
  const [flip, setFlip] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFlip((currentFlip) => {
        if (currentFlip) setCard((currentCard) => getNextProgressCard(currentCard));
        return !currentFlip;
      });
    }, FLIP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Box
      role="progressbar"
      aria-label="Cargando"
      {...props}
      sx={[
        {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width,
          height: `calc(${width} * 1.48)`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FlipGameCard disableButton shadow flip={flip} width={width} card={card} />
      <CircularProgress size="1.2em" color="inherit" sx={{ position: "absolute" }} />
    </Box>
  );
};
