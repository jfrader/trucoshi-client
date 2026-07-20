import { Box, IconButton, Stack, styled, type BoxProps } from "@mui/material";
import { useEffect, useRef, useState, type SetStateAction } from "react";
import type { ICard } from "trucoshi";
import { FlipGameCard } from "./GameCard";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { HandCardContainer } from "./HandCardContainer";
import { useSound } from "../../sound/hooks/useSound";
import { Deck } from "trucoshi/dist/lib";

const deck = Deck();
deck.random.secret = Math.random().toString();
deck.random.bitcoinHash = Math.random().toString();
deck.random.clients = [Math.random().toString()];
deck.shuffle(0);

const INITIAL_CARDS = ["1e", "1b", "7e"] as ICard[];

const CardTogglerRoot = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: theme.zIndex.appBar - 1,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  columnGap: theme.spacing(1),
  overflow: "visible",
  [theme.breakpoints.down("md")]: { display: "block" },
}));

const CardPreview = styled(Box)(({ theme }) => ({
  position: "relative",
  minWidth: 0,
  height: "100%",
  paddingTop: theme.spacing(3),
  boxSizing: "border-box",
  overflow: "visible",
}));

const CardActions = styled(Stack)(({ theme }) => ({
  position: "relative",
  zIndex: theme.zIndex.appBar + 3,
  alignSelf: "start",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    position: "absolute",
    top: 0,
    left: "min(calc(50% + 8.75rem), calc(100% - 3.25rem))",
  },
}));

export const CardToggler = (props: BoxProps) => {
  const { queue } = useSound();
  const [randomCards, setRandomCards] = useState<ICard[]>(() => [...INITIAL_CARDS]);
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
    const timeout = setTimeout(() => setFlip(false), 1750);
    return () => {
      clearTimeout(timeout);
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CardTogglerRoot height="7em" {...props}>
      <CardPreview>
        {randomCards.map((card, i) => {
          return (
            <HandCardContainer
              centered
              open
              openMargin={6}
              fontSize="11px"
              key={card}
              rotationSeed={card}
              cards={randomCards.length}
              i={i}
            >
              <FlipGameCard width="3.3rem" shadow flip={flip} zoom card={card as ICard} />
            </HandCardContainer>
          );
        })}
      </CardPreview>

      <CardActions role="group" aria-label="Controles de cartas">
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
      </CardActions>
    </CardTogglerRoot>
  );
};
