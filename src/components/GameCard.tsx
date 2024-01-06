import { Box, Button, ButtonProps, styled } from "@mui/material";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard } from "trucoshi";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { ICardTheme } from "../trucoshi/types";
import { ElementType, MouseEventHandler, useCallback } from "react";
import { useCards } from "../trucoshi/hooks/useCards";

export type GameCardProps = {
  card: ICard;
  enableHover?: boolean;
  zoom?: boolean;
  width?: string;
  theme?: ICardTheme | null;
  request?: boolean;
  shadow?: boolean;
  as?: ElementType;
} & ButtonProps;

export const GameCard = ({
  card,
  enableHover,
  request,
  zoom,
  shadow,
  width = "4.4em",
  theme = null,
  ...buttonProps
}: GameCardProps) => {
  const [{ cardTheme, cards, cardsReady }, { inspectCard }] = useTrucoshi();

  const usedTheme = theme !== null ? theme : cardTheme;

  const [reqCards, reqReady] = useCards({ theme, disabled: !request, cards: [card] });

  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (e.type !== "click" || e.nativeEvent.button === 2) {
        inspectCard(card || BURNT_CARD);
      }
    },
    [card, inspectCard]
  );

  if (usedTheme && ((!request && !cardsReady) || (request && !reqReady))) {
    return null;
  }

  if (usedTheme) {
    return (
      <GameCardButton
        variant="card"
        name={card || BURNT_CARD}
        zoom={zoom ? 1 : 0}
        shadow={shadow ? 1 : 0}
        enablehover={enableHover ? 1 : 0}
        onClick={onClick}
        onContextMenu={onClick}
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
      name={card || BURNT_CARD}
      emojicard={1}
      zoom={zoom ? 1 : 0}
      shadow={shadow ? 1 : 0}
      onClick={onClick}
      onContextMenu={onClick}
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
          <GameCard {...props} card={BURNT_CARD} />
        </Box>
      </Box>
    </Box>
  );
};

const GameCardButton = styled(Button)<{
  enablehover?: boolean | number;
  emojicard?: boolean | number;
  zoom?: boolean | number;
  shadow?: boolean | number;
}>(({ theme, enablehover, emojicard, zoom, shadow }) => [
  {
    lineHeight: 1,
    position: "relative",
    transition: theme.transitions.create(["transform", "box-shadow"], {
      duration: theme.transitions.duration.standard,
    }),
  },
  shadow
    ? {
        boxShadow: theme.shadows[4],
      }
    : {},
  zoom
    ? {
        transform: "scale(1.75)",
      }
    : {},
  emojicard
    ? {
        width: "4.4em",
        height: "5.58rem",
        fontWeight: 700,
        padding: "0.6rem 0.2rem",
      }
    : {
        padding: 0,
        margin: 0,
        background: "transparent",
        border: "none",
        outline: "none",
      },
  enablehover
    ? {
        "&:hover": {
          boxShadow: theme.shadows[4],
          zIndex: theme.zIndex.appBar,
          transform: "scale(1.5)",
          "& *": {
            zIndex: theme.zIndex.appBar,
          },
        },
      }
    : {},
]);
