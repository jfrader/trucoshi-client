import { Box, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Deck } from "trucoshi/dist/lib";
import { FlipGameCard } from "./GameCard";
import { HandCardContainer } from "./HandCardContainer";
import { shuffle } from "../../assets/animations/shuffle";
import { useSound } from "../../sound/hooks/useSound";

export const CardsDeck = ({ flip, shuffle }: { flip?: boolean; shuffle?: any }) => {
  const { queue } = useSound();
  const [running, setRunning] = useState(false);
  const [deck, setDeck] = useState(() => {
    const d = Deck();
    return d.shuffle(0);
  });

  const makeShuffle = useCallback(() => {
    setDeck((d) => {
      setRunning(true);
      d.random.next();
      queue("play1");
      queue("shuffle");
      queue("play1");
      return { ...d.shuffle(0) };
    });
  }, [queue]);

  useEffect(() => {
    if (shuffle) {
      makeShuffle();
    }
  }, [shuffle, makeShuffle]);

  return (
    <Box position="relative" onClick={makeShuffle}>
      {deck.cards.map((card, i) => (
        <AnimatedBox
          key={card}
          delay={i === deck.cards.length - 1 ? 0 : undefined}
          running={running}
          position="fixed"
          top="100%"
          right="5em"
          marginTop="-7em"
        >
          <HandCardContainer margin={0} openMargin={1} cards={deck.cards.length} i={i} open={false}>
            <FlipGameCard flip={flip} disableDoubleClick card={card} />
          </HandCardContainer>
        </AnimatedBox>
      ))}
    </Box>
  );
};

export const AnimatedBox = styled(Box)<{ running?: boolean; delay?: number }>(
  ({ running, delay }) => ({
    animationPlayState: "running",
    animation: running ? `${shuffle} 0.37s ease-in-out` : "unset",
    animationDelay: `${delay ?? Math.random() + "s"}`,
  })
);
