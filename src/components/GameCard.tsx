import { Box, Button, ButtonProps, styled } from "@mui/material";
import { CARDS_HUMAN_READABLE, ICard } from "trucoshi";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { ICardTheme } from "../trucoshi/types";
import { ElementType } from "react";
import { useCards } from "../trucoshi/hooks/useCards";

export const GameCard = ({
  children,
  card,
  enableHover,
  request,
  width = "4.4em",
  theme = null,
  ...buttonProps
}: {
  card: ICard;
  enableHover?: boolean;
  width?: string;
  theme?: ICardTheme | null;
  request?: boolean;
  as?: ElementType;
} & ButtonProps) => {
  const [{ cardTheme, cards, cardsReady }] = useTrucoshi();

  const usedTheme = theme !== null ? theme : cardTheme;

  const [reqCards, reqReady] = useCards({ theme, disabled: !request, cards: [card] });

  if (usedTheme && ((!request && !cardsReady) || (request && !reqReady))) {
    return null;
  }

  if (usedTheme) {
    return (
      <GameCardButton
        variant="card"
        name={card || "xx"}
        enablehover={enableHover ? 1 : 0}
        {...buttonProps}
      >
        <img
          alt={CARDS_HUMAN_READABLE[card] || "Carta quemada"}
          style={{
            objectFit: "cover",
            width,
          }}
          src={request ? reqCards[card] : cards[card]}
        />
      </GameCardButton>
    );
  }

  return (
    <GameCardButton
      variant="emojicard"
      name={card || "xx"}
      emojicard={1}
      enablehover={enableHover ? 1 : 0}
      {...buttonProps}
    >
      <Box>{CARDS_HUMAN_READABLE[card] || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
    </GameCardButton>
  );
};

const GameCardButton = styled(Button)<{
  enablehover?: boolean | number;
  emojicard?: boolean | number;
}>(({ theme, enablehover, emojicard }) => [
  {
    transition: theme.transitions.create(["transform"], {
      duration: theme.transitions.duration.standard,
    }),
  },
  emojicard
    ? {
        width: "4.4em",
        minHeight: "5.32rem",
        fontWeight: 700,
        padding: "0.6rem 0.2rem",
      }
    : {},
  enablehover
    ? {
        "&:hover": {
          zIndex: 1911,
          transform: "scale(1.4)",
          "& *": {
            zIndex: 1911,
          },
        },
      }
    : {},
]);

const randDeg = () => Math.round(Math.random() * 4) * (Math.random() > 0.5 ? 1 : -1);
const getMargin = (i: number, cards: number) =>
  cards > 1 && i % 2 === 0 ? `calc((7px * ${i}) ${i === 0 ? "- 2.68" : "+ 2"}rem)` : 0;

export const GameCardContainer = styled(Box)<{ open: boolean; cards: number; i: number }>(
  ({ theme, open, cards, i }) => {
    const margin = 10 * i + "px";
    const openMargin = getMargin(i, cards);
    return [
      {
        position: "absolute",
        left: "50%",
        right: "50%",
        transform: `rotate(${randDeg()}deg)`,
        marginLeft: i !== undefined ? margin : 0,
        transition: theme.transitions.create(["transform", "margin-top", "margin-left"], {
          duration: theme.transitions.duration.standard,
        }),
      },
      open
        ? {
            transform: `rotate(${randDeg()}deg) scale(1.6)`,
            marginTop: 0,
            marginLeft: openMargin,
            zIndex: 1911,
            "& *": {
              zIndex: 1911,
            },
          }
        : {
            zIndex: 1910,
            "& *": {
              zIndex: 1910,
            },
          },
    ];
  }
);
