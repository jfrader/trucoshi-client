import { Box, BoxProps, IconButton, Stack } from "@mui/material";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { ICard } from "trucoshi";
import { FlipGameCard } from "./GameCard";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { HandCardContainer } from "./HandCardContainer";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useSound } from "../../sound/hooks/useSound";
import { Deck } from "trucoshi/dist/lib";
import { InventoryButton } from "./InventoryButton";
import { INITIAL_CARD_TOGGLER_CARDS } from "../../trucoshi/cards/criticalCardAssets";

const deck = Deck();
deck.random.secret = Math.random().toString();
deck.random.bitcoinHash = Math.random().toString();
deck.random.clients = [Math.random().toString()];
deck.shuffle(0);

export const CardToggler = (props: BoxProps) => {
  const { queue } = useSound();
  const [{ equippedDeck }] = useTrucoshi();
  const [randomCards, setRandomCards] = useState<ICard[]>(() => [...INITIAL_CARD_TOGGLER_CARDS]);
  const [flip, _setFlip] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFlip = (v: SetStateAction<boolean>) => {
    setDisabled(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setDisabled(false);
    }, 350);

    _setFlip(v);
  };

  useEffect(() => {
    queue("play0");
  }, [flip, queue]);

  useEffect(() => {
    setFlip(true);
    const timeout = setTimeout(() => setFlip(false), 750);
    return () => {
      clearTimeout(timeout);
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

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
              rotationSeed={card}
              cards={randomCards.length}
              i={i}
            >
              <FlipGameCard
                width="3.3rem"
                shadow
                flip={flip}
                zoom
                card={card as ICard}
                cardSkinByCard={equippedDeck}
              />
            </HandCardContainer>
          );
        })}
      </Box>

      <Stack justifyContent="end" alignItems="end" position="absolute" right="0" top="0">
        <IconButton
          title="Repartir"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();

            setDisabled(true);
            if (timer.current) {
              clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
              setDisabled(false);
            }, 200);

            const rndSound = Math.ceil(Math.random() * 2);
            queue("play" + rndSound);
            deck.random.clients = [Math.random().toString()];
            deck.random.nonce = 0;
            deck.shuffle(0);
            setRandomCards(deck.takeThree());
          }}
          size="large"
          color="primary"
        >
          <Refresh />
        </IconButton>
        <IconButton
          title="Girar"
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
        <InventoryButton />
      </Stack>
    </Box>
  );
};
