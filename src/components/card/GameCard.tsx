import { Box, Button, ButtonProps, styled } from "@mui/material";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard, SUITS_HUMAN_READABLE } from "trucoshi";
import { ElementType, memo, MouseEventHandler } from "react";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import {
  CardTheme,
  getCardImageUrl,
  normalizeCardTheme,
} from "../../trucoshi/cardThemes";
import {
  getReadyCardImageSource,
  useCardImagePreload,
} from "../../trucoshi/cardImageLoader";

const cardContainerSx = {
  position: "relative",
  display: "inline-block",
  lineHeight: 1,
  perspective: "28em",
};

const flipContainerSx = (width: string) => ({
  ...cardContainerSx,
  width,
  height: `calc(${width} * 1.48)`,
});

const flipWrapperSx = {
  position: "relative",
  width: "100%",
  height: "100%",
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

const emojiCardContentSx = {
  letterSpacing: 0,
  px: "2px",
  width: "100%",
  fontSize: "35cqw",
  textAlign: "center",
};

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

const mergeCardFrameSx = (width: string, cardSx: ButtonProps["sx"]) => {
  const frameSx = {
    width,
    height: `calc(${width} * 1.48)`,
    borderRadius: `calc(${width} / 13)`,
    overflow: "hidden",
  };

  if (!cardSx) {
    return frameSx;
  }

  return [frameSx, ...(Array.isArray(cardSx) ? cardSx : [cardSx])];
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

const GameCardComponent = ({
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
  sx: cardSx,
  ...buttonProps
}: GameCardProps) => {
  const [{ cardTheme }, { inspectCard }] = useTrucoshi();
  const name = burn ? BURNT_CARD : card;
  const selectedTheme = normalizeCardTheme(theme ?? cardTheme);
  const requestedImageSource =
    selectedTheme === "emoji" ? null : getCardImageUrl(selectedTheme, name);

  useCardImagePreload([requestedImageSource], selectedTheme === "emoji", "high");

  const imageSource = getReadyCardImageSource(requestedImageSource);
  const renderBitmap = Boolean(imageSource);
  const humanCard = CARDS_HUMAN_READABLE[name];
  const suit = SUITS_HUMAN_READABLE[name.charAt(1) as "e" | "o" | "c" | "b"];
  const cardLabel = humanCard || "Carta boca abajo";

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

  const events: ButtonProps = disableButton
    ? { component: "div" }
    : {
        onClick,
        onContextMenu: onClick,
        onDoubleClick,
      };

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
      sx={mergeCardFrameSx(width, cardSx)}
      {...events}
      {...buttonProps}
    >
      {renderBitmap ? (
        <Box
          component="img"
          alt={cardLabel}
          src={imageSource}
          loading="eager"
          decoding="sync"
          draggable={false}
          sx={{ display: "block", objectFit: "contain", width: "100%", height: "100%" }}
        />
      ) : (
        <Box sx={emojiCardContentSx}>
          <Box sx={suitTopSx}>{suit}</Box>
          <Box>{humanCard || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
          <Box sx={suitBottomSx}>{suit}</Box>
        </Box>
      )}
    </GameCardButton>
  );
};

export type FlipGameCardProps = { flip?: boolean } & GameCardProps;

const FlipGameCardComponent = ({ flip = false, width = "4.4em", ...props }: FlipGameCardProps) => (
  <Box sx={flipContainerSx(width)}>
    <Box sx={flip ? flipWrapperFlippedSx : flipWrapperSx}>
      <Box sx={{ ...frontCardSx, pointerEvents: flip ? "none" : "auto" }}>
        <GameCard {...props} width={width} />
      </Box>
      <Box sx={{ ...backCardSx, pointerEvents: flip ? "auto" : "none" }}>
        <GameCard {...props} width={width} card={BURNT_CARD} />
      </Box>
    </Box>
  </Box>
);

const GameCardButton = styled(Button, {
  shouldForwardProp: (prop) =>
    ![
      "enablehover",
      "emojicard",
      "zoom",
      "shadow",
      "scale",
      "disableEvents",
      "disabledmask",
    ].includes(prop as string),
})<{
  enablehover?: boolean;
  emojicard?: boolean;
  zoom?: boolean;
  shadow?: boolean;
  scale?: number;
  disableEvents?: boolean;
  disabledmask?: boolean;
}>(
  ({
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
    containerType: "inline-size",
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
  }),
);

export const GameCard = memo(GameCardComponent);
export const FlipGameCard = memo(FlipGameCardComponent);
