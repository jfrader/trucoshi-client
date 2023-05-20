import { Box, Button, ButtonProps, styled } from "@mui/material";
import { CARDS_HUMAN_READABLE, ICard } from "trucoshi";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { ICardTheme } from "../trucoshi/types";
import { ElementType } from "react";
import { useCards } from "../trucoshi/hooks/useCards";

export type GameCardProps = {
  card: ICard;
  enableHover?: boolean;
  zoom?: boolean;
  width?: string;
  theme?: ICardTheme | null;
  request?: boolean;
  as?: ElementType;
} & ButtonProps;

export const GameCard = ({
  children,
  card,
  enableHover,
  request,
  zoom,
  width = "4.4em",
  theme = null,
  ...buttonProps
}: GameCardProps) => {
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
        zoom={zoom ? 1 : 0}
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
      zoom={zoom ? 1 : 0}
      enablehover={enableHover ? 1 : 0}
      {...buttonProps}
    >
      <Box
        sx={{
          letterSpacing: 0,
          pr: "2px",
        }}
      >
        <Box>{CARDS_HUMAN_READABLE[card] || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
      </Box>
    </GameCardButton>
  );
};

export type FlipGameCardProps = { flip?: boolean } & GameCardProps;

export const FlipGameCard = ({ flip, ...props }: FlipGameCardProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        lineHeight: 1,
        perspective: "28em",
      }}
    >
      <Box
        sx={[
          {
            lineHeight: 1,
            letterSpacing: 0,
            pr: "2px",
            transition: "transform 0.3s",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          },
          flip
            ? {
                transform: "rotateY(180deg)",
              }
            : {},
        ]}
      >
        <Box
          sx={{
            lineHeight: 1,
            position: "absolute",
            backfaceVisibility: "hidden",
          }}
        >
          <GameCard {...props} />
        </Box>
        <Box
          sx={{
            lineHeight: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <GameCard {...props} card={"xx" as ICard} />
        </Box>
      </Box>
    </Box>
  );
};

const GameCardButton = styled(Button)<{
  enablehover?: boolean | number;
  emojicard?: boolean | number;
  zoom?: boolean | number;
}>(({ theme, enablehover, emojicard, zoom }) => [
  {
    lineHeight: 1,
    position: "relative",
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(["transform", "box-shadow"], {
      duration: theme.transitions.duration.standard,
    }),
  },
  zoom
    ? {
        boxShadow: theme.shadows[10],
        transform: "scale(1.5)",
      }
    : {},
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
          boxShadow: theme.shadows[10],
          zIndex: 1911,
          transform: "scale(1.5)",
          "& *": {
            zIndex: 1911,
          },
        },
      }
    : {},
]);
