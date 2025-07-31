import { Box, Button, ButtonProps, styled } from "@mui/material";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard } from "trucoshi";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { ICardTheme } from "../../trucoshi/types";
import { ElementType, MouseEventHandler, useCallback } from "react";
import { useCards } from "../../trucoshi/hooks/useCards";
import { SUITS_HUMAN_READABLE } from "trucoshi";

export type GameCardProps = {
  card: ICard;
  disableDoubleClick?: boolean;
  enableHover?: boolean;
  burn?: boolean;
  zoom?: boolean;
  scale?: number;
  width?: string;
  theme?: ICardTheme;
  request?: boolean;
  shadow?: boolean;
  as?: ElementType;
} & ButtonProps;

export const GameCard = ({
  card,
  disableDoubleClick,
  enableHover,
  burn,
  request,
  zoom,
  scale,
  shadow,
  width = "4.4em",
  theme = "",
  ...buttonProps
}: GameCardProps) => {
  const [{ cardTheme, cards, cardsReady }, { inspectCard }] = useTrucoshi();

  const usedTheme = theme !== "" ? theme : cardTheme;

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

  const onDoubleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    if (disableDoubleClick) return;
    inspectCard(card || BURNT_CARD);
  }, [card, disableDoubleClick, inspectCard]);

  if (usedTheme && ((!request && !cardsReady) || (request && !reqReady))) {
    return null;
  }

  const name = burn ? BURNT_CARD : card;

  if (usedTheme) {
    return (
      <GameCardButton
        variant="card"
        name={name || BURNT_CARD}
        zoom={zoom ? 1 : 0}
        scale={scale}
        shadow={shadow ? 1 : 0}
        enablehover={enableHover ? 1 : 0}
        onClick={onClick}
        onContextMenu={onClick}
        onDoubleClick={onDoubleClick}
        {...buttonProps}
      >
        <img
          alt={CARDS_HUMAN_READABLE[name] || "Carta quemada"}
          style={{
            objectFit: "cover",
            width,
          }}
          src={request ? reqCards[name] : cards[name]}
        />
      </GameCardButton>
    );
  }

  const humanCard = CARDS_HUMAN_READABLE[card];
  const suit = SUITS_HUMAN_READABLE[card.charAt(1) as "e" | "o" | "c" | "b"];

  return (
    <GameCardButton
      variant="emojicard"
      name={card || BURNT_CARD}
      emojicard={1}
      zoom={zoom ? 1 : 0}
      shadow={shadow ? 1 : 0}
      scale={scale}
      onClick={onClick}
      onContextMenu={onClick}
      onDoubleClick={onDoubleClick}
      enablehover={enableHover ? 1 : 0}
      {...buttonProps}
      sx={{
        width,
        height: `calc(${width} * 1.48)`,
        borderRadius: `calc(${width} / 13)`,
        ...buttonProps.sx,
      }}
    >
      <Box
        sx={{
          letterSpacing: 0,
          px: "2px",
          width: "100%",
          fontSize: `calc(${width} * 0.3)`,
          textAlign: "center",
        }}
      >
        <Box sx={{ position: "absolute", top: "3%", right: 0, opacity: 0.15 }}>{suit}</Box>
        <Box>{humanCard || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
        <Box sx={{ position: "absolute", bottom: "3%", left: 0, opacity: 0.15 }}>{suit}</Box>
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
  scale?: number;
}>(({ theme, enablehover, emojicard, zoom, shadow, scale = 1.75 }) => [
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
        transform: `scale(${scale})`,
      }
    : {},
  emojicard
    ? {
        fontWeight: 700,
        textAlign: "center",
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
