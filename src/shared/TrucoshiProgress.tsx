import { Box, BoxProps, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { CARDS, ICard } from "trucoshi";
import { FlipGameCard } from "../components/card/GameCard";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

const PROGRESS_CARDS = Object.keys(CARDS) as ICard[];
const INITIAL_CARD = PROGRESS_CARDS[0];
const FLIP_INTERVAL_MS = 850;

const getRandomProgressCard = (currentCard: ICard) => {
  if (PROGRESS_CARDS.length <= 1) {
    return currentCard;
  }

  const currentIndex = PROGRESS_CARDS.indexOf(currentCard);
  const randomOffset = Math.floor(Math.random() * (PROGRESS_CARDS.length - 1)) + 1;
  const nextIndex = (Math.max(currentIndex, 0) + randomOffset) % PROGRESS_CARDS.length;
  return PROGRESS_CARDS[nextIndex];
};

type TrucoshiProgressProps = BoxProps & {
  width?: string;
};

export const TrucoshiProgress = ({ width = "4rem", ...props }: TrucoshiProgressProps) => {
  const [{ cardDisplayImagesReady = true, equippedDeck }] = useTrucoshi();
  const [card, setCard] = useState<ICard>(INITIAL_CARD);
  const [flip, setFlip] = useState(true);

  useEffect(() => {
    if (!cardDisplayImagesReady) {
      setFlip(true);
      return;
    }

    const interval = setInterval(() => {
      setFlip((currentFlip) => {
        if (currentFlip) {
          setCard((currentCard) => getRandomProgressCard(currentCard));
        }

        return !currentFlip;
      });
    }, FLIP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [cardDisplayImagesReady]);

  return (
    <Box
      role="progressbar"
      aria-label="Cargando"
      {...props}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: `calc(${width} * 1.48)`,
        ...props.sx,
      }}
    >
      <FlipGameCard
        disableButton
        shadow
        flip={flip}
        width={width}
        card={card}
        cardSkinByCard={equippedDeck}
      />
      <CircularProgress size="1.2em" color="inherit" sx={{position: "absolute"}} />
    </Box>
  );
};
