import { Box, Button, ButtonProps, styled } from "@mui/material";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard, SUITS_HUMAN_READABLE } from "trucoshi";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useState } from "react";
import type { ElementType, MouseEventHandler } from "react";
import {
  CardTheme,
  getCardImageUrl,
  normalizeCardTheme,
} from "../../trucoshi/cardThemes";

const cardContainerSx = {
  position: "relative",
  lineHeight: 1,
  perspective: "28em",
};

const flipWrapperSx = {
  lineHeight: 1,
  letterSpacing: 0,
  pr: "2px",
  transition: "transform 0.3s",
  transformStyle: "preserve-3d",
  backfaceVisibility: "hidden",
};

const flipWrapperFlippedSx = {
  ...flipWrapperSx,
  transform: "rotateY(180deg)",
};

const frontCardSx = {
  lineHeight: 1,
  position: "absolute",
  backfaceVisibility: "hidden",
};

const backCardSx = {
  lineHeight: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
  backfaceVisibility: "hidden",
  transform: "rotateY(180deg)",
};

const emojiCardContentSx = (width: string) => ({
  letterSpacing: 0,
  px: "2px",
  width: "100%",
  fontSize: `calc(${width} * 0.3)`,
  textAlign: "center",
});

const suitTopSx = {
  position: "absolute",
  top: "3%",
  right: 0,
  opacity: 0.15,
};

const suitBottomSx = {
  position: "absolute",
  bottom: "3%",
  left: 0,
  opacity: 0.15,
};

export type GameCardProps = {
  card: ICard;
  disableButton?: boolean;
  disabledMask?: boolean;
  disableDoubleClick?: boolean;
  enableHover?: boolean;
  burn?: boolean;
  zoom?: boolean;
  scale?: number;
  width?: string;
  theme?: CardTheme;
  shadow?: boolean;
  as?: ElementType;
} & ButtonProps;

const _GameCard = ({
  card,
  disableDoubleClick = false,
  enableHover = false,
  burn = false,
  zoom = false,
  scale = 1.75,
  shadow = false,
  width = "4.4em",
  disableButton,
  disabledMask = false,
  theme,
  ...buttonProps
}: GameCardProps) => {
  const [{ cardTheme }, { inspectCard }] = useTrucoshi();
  const [failedImageSource, setFailedImageSource] = useState<string | null>(null);

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (event.type !== "click" || event.button === 2) {
      inspectCard(card || BURNT_CARD);
    }
  };

  const onDoubleClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (!disableDoubleClick) {
      inspectCard(card || BURNT_CARD);
    }
  };

  const name = burn ? BURNT_CARD : card;
  const selectedTheme = normalizeCardTheme(theme ?? cardTheme);
  const imageSource =
    selectedTheme === "emoji" ? null : getCardImageUrl(selectedTheme, name);
  const renderBitmap = Boolean(imageSource && failedImageSource !== imageSource);

  const events: ButtonProps = disableButton
    ? { component: "div" }
    : {
        onClick: onClick,
        onContextMenu: onClick,
        onDoubleClick: onDoubleClick,
      };

  const humanCard = CARDS_HUMAN_READABLE[name];
  const suit = SUITS_HUMAN_READABLE[name.charAt(1) as "e" | "o" | "c" | "b"];
  const cardLabel = humanCard || "Carta boca abajo";
  const { sx, ...restButtonProps } = buttonProps;

  return (
    <GameCardButton
      variant={renderBitmap ? "card" : "emojicard"}
      name={name}
      emojicard={!renderBitmap}
      zoom={zoom}
      shadow={shadow}
      scale={scale}
      enablehover={enableHover}
      disableEvents={disableButton}
      disabledmask={disabledMask}
      data-card-theme={selectedTheme}
      aria-label={cardLabel}
      sx={{
        width,
        height: renderBitmap ? "auto" : `calc(${width} * 1.48)`,
        borderRadius: `calc(${width} / 13)`,
        overflow: "hidden",
        ...sx,
      }}
      {...events}
      {...restButtonProps}
    >
      {renderBitmap ? (
        <Box
          component="img"
          alt={cardLabel}
          src={imageSource || undefined}
          onError={() => setFailedImageSource(imageSource)}
          sx={{ display: "block", objectFit: "contain", width: "100%" }}
        />
      ) : (
        <Box sx={emojiCardContentSx(width)}>
          <Box sx={suitTopSx}>{suit}</Box>
          <Box>{humanCard || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
          <Box sx={suitBottomSx}>{suit}</Box>
        </Box>
      )}
    </GameCardButton>
  );
};

export type FlipGameCardProps = { flip?: boolean } & GameCardProps;

const _FlipGameCard = ({ flip = false, ...props }: FlipGameCardProps) => (
  <Box sx={cardContainerSx}>
    <Box sx={flip ? flipWrapperFlippedSx : flipWrapperSx}>
      <Box sx={frontCardSx}>
        <GameCard {...props} />
      </Box>
      <Box sx={backCardSx}>
        <GameCard {...props} card={BURNT_CARD} />
      </Box>
    </Box>
  </Box>
);

const GameCardButton = styled(Button, {
  shouldForwardProp: (prop) =>
    !["enablehover", "emojicard", "zoom", "shadow", "scale", "disableEvents", "disabledmask"].includes(
      prop as string
    ),
})<{
  enablehover?: boolean;
  emojicard?: boolean;
  zoom?: boolean;
  shadow?: boolean;
  scale?: number;
  disableEvents?: boolean;
  disabledmask?: boolean;
}>(({
  theme,
  enablehover,
  emojicard,
  zoom,
  shadow,
  scale = 1.75,
  disableEvents = false,
  disabledmask = false,
}) => ({
  lineHeight: 1,
  position: "relative",
  transition: theme.transitions.create(["transform", "box-shadow"], {
    duration: theme.transitions.duration.standard,
  }),
  ...(disableEvents && { pointerEvents: "none" }),
  ...(shadow && { boxShadow: theme.shadows[4] }),
  ...(zoom && { transform: `scale(${scale})` }),
  ...(emojicard
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
      }),
  ...(enablehover && {
    transformOrigin: "50% 100%",
    "@media (hover: hover) and (pointer: fine)": {
      "&:hover": {
        boxShadow: theme.shadows[4],
        zIndex: theme.zIndex.fab - 1,
        transform: "translateY(-9%) scale(1.5)",
        "& *": {
          zIndex: theme.zIndex.fab - 1,
        },
      },
    },
  }),
  ...(disabledmask && {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      border: "1px solid rgba(255,255,255,0.14)",
      backgroundColor: "rgba(7, 10, 9, 0.42)",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.22)",
      pointerEvents: "none",
      zIndex: 3,
    },
  }),
}));

export const GameCard = _GameCard;
export const FlipGameCard = _FlipGameCard;
