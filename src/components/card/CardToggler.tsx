import { Box, BoxProps, IconButton, Stack } from "@mui/material";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { ICard } from "trucoshi";
import { FlipGameCard } from "./GameCard";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { HandCardContainer } from "./HandCardContainer";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useSound } from "../../sound/hooks/useSound";
import { IDeck } from "trucoshi";
import { Deck } from "trucoshi/dist/lib";

export const CardToggler = (props: BoxProps) => {
  const deck = useRef<IDeck>(Deck().shuffle(0));
  const { queue } = useSound();
  const [{ cardTheme }] = useTrucoshi();
  const [randomCards, setRandomCards] = useState<ICard[]>(() => deck.current.takeThree());
  const [flip, _setFlip] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const setFlip = (v: SetStateAction<boolean>) => {
    setDisabled(true);
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDisabled(false);
    }, 350);

    queue("play0");
    _setFlip(v);
  };

  useEffect(() => {
    setFlip(true);
    const timeout = setTimeout(() => setFlip(false), 750);
    return () => {
      clearTimeout(timeout);
      timer.current && clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardTheme]);

  return (
    <Box
      pt={3}
      height="7em"
      sx={(theme) => ({ position: "relative", zIndex: theme.zIndex.appBar - 1 })}
      {...props}
    >
      <Box position="relative" left={-25}>
        {randomCards.map((card, i) => {
          return (
            <HandCardContainer
              open
              openMargin={6}
              fontSize="11px"
              key={card}
              cards={randomCards.length}
              i={i}
            >
              <FlipGameCard width="3.3rem" shadow flip={flip} zoom card={card as ICard} />
            </HandCardContainer>
          );
        })}
      </Box>

      <Stack justifyContent="end" alignItems="end" position="absolute" right="0" top="0">
        <IconButton
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();

            setDisabled(true);
            timer.current && clearTimeout(timer.current);
            timer.current = setTimeout(() => {
              setDisabled(false);
            }, 200);

            const rndSound = Math.ceil(Math.random() * 2);
            queue("play" + rndSound);
            deck.current.shuffle(0);
            setRandomCards(deck.current.takeThree());
          }}
          size="large"
          color="primary"
        >
          <Refresh />
        </IconButton>
        <IconButton
          disabled={disabled}
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
