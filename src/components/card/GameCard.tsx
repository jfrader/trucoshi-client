import { Box, Button, ButtonProps, styled } from "@mui/material";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard, SUITS_HUMAN_READABLE } from "trucoshi";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CardDisplayMode } from "../../trucoshi/cards/cardSkinResolver";
import { resolveInspectionCardSkinId } from "../../trucoshi/cards/cardInspection";
import { CardSkinId } from "../../trucoshi/cards/skinRegistry";
import { ElementType, memo, MouseEventHandler } from "react";
import {
  getCardImageRequestSources,
  getReadyCardImageSource,
  useCardImagePreload,
} from "../../trucoshi/cards/cardImageLoader";

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
  cardSkinId?: CardSkinId;
  cardSkinByCard?: Partial<Record<ICard, CardSkinId>>;
  fallbackCardSkinId?: CardSkinId;
  displayMode?: CardDisplayMode;
  inspectCardValue?: ICard;
  inspectCardSkinId?: CardSkinId;
  inspectFlip?: boolean;
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
  cardSkinId,
  cardSkinByCard,
  fallbackCardSkinId,
  displayMode,
  inspectCardValue,
  inspectCardSkinId,
  inspectFlip,
  ...buttonProps
}: GameCardProps) => {
  const [{ cardDisplayImagesReady = true, cardDisplayMode }, { inspectCard }] = useTrucoshi();

  const usesGlobalDisplayMode = !displayMode;
  const effectiveDisplayMode = displayMode || cardDisplayMode || "skins";
  const renderDisplayMode =
    usesGlobalDisplayMode && effectiveDisplayMode !== "emoji" && !cardDisplayImagesReady
      ? "emoji"
      : effectiveDisplayMode;
  const name = burn ? BURNT_CARD : card;
  const inspectionCard = inspectCardValue || card || BURNT_CARD;
  const inspectedCardSkinId =
    inspectionCard !== BURNT_CARD
      ? inspectCardSkinId ||
        resolveInspectionCardSkinId({
          card: inspectionCard,
          cardSkinId,
          cardSkinByCard,
        })
      : undefined;
  const imageRequest = {
    card: name,
    cardSkinId: name === card ? cardSkinId : undefined,
    cardSkinByCard: name === card ? cardSkinByCard : undefined,
    displayMode: renderDisplayMode,
    fallbackCardSkinId: name === card ? fallbackCardSkinId : undefined,
  };

  useCardImagePreload(
    getCardImageRequestSources(imageRequest),
    renderDisplayMode === "emoji",
  );

  const inspectRenderedCard = () => {
    inspectCard({
      card: inspectionCard,
      cardSkinId: inspectedCardSkinId,
      displayMode,
      flip: inspectFlip,
    });
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (e.type !== "click" || e.button === 2) {
      inspectRenderedCard();
    }
  };

  const onDoubleClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (!disableDoubleClick) {
      inspectRenderedCard();
    }
  };

  const imageSource = getReadyCardImageSource(imageRequest);
  const showImage = Boolean(imageSource);

  const events: ButtonProps = disableButton
    ? { component: "div" }
    : {
        onClick: onClick,
        onContextMenu: onClick,
        onDoubleClick: onDoubleClick,
      };

  if (showImage) {
    return (
      <GameCardButton
        variant="card"
        name={name}
        zoom={zoom}
        scale={scale}
        shadow={shadow}
        enablehover={enableHover}
        disableEvents={disableButton}
        disabledmask={disabledMask}
        sx={{
          width,
          height: `calc(${width} * 1.48)`,
          borderRadius: `calc(${width} / 13)`,
          overflow: "hidden",
          ...buttonProps.sx,
        }}
        {...events}
        {...buttonProps}
      >
        <img
          alt={CARDS_HUMAN_READABLE[name] || "Carta quemada"}
          style={{ objectFit: "cover", width }}
          src={imageSource}
          loading="eager"
          decoding="sync"
          draggable={false}
        />
      </GameCardButton>
    );
  }

  const humanCard = CARDS_HUMAN_READABLE[card];
  const suit = SUITS_HUMAN_READABLE[card.charAt(1) as "e" | "o" | "c" | "b"];

  return (
    <GameCardButton
      variant="emojicard"
      name={name}
      emojicard
      zoom={zoom}
      shadow={shadow}
      scale={scale}
      onClick={onClick}
      onContextMenu={onClick}
      onDoubleClick={onDoubleClick}
      enablehover={enableHover}
      disableEvents={disableButton}
      disabledmask={disabledMask}
      sx={{
        width,
        height: `calc(${width} * 1.48)`,
        borderRadius: `calc(${width} / 13)`,
        overflow: "hidden",
        ...buttonProps.sx,
      }}
      {...buttonProps}
    >
      <Box sx={emojiCardContentSx(width)}>
        <Box sx={suitTopSx}>{suit}</Box>
        <Box>{humanCard || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
        <Box sx={suitBottomSx}>{suit}</Box>
      </Box>
    </GameCardButton>
  );
};

export type FlipGameCardProps = { flip?: boolean } & GameCardProps;

const _FlipGameCard = ({ flip = false, width = "4.4em", ...props }: FlipGameCardProps) => {
  const inspectedBackCardSkinId =
    props.card !== BURNT_CARD
      ? resolveInspectionCardSkinId({
          card: props.card,
          cardSkinId: props.cardSkinId,
          cardSkinByCard: props.cardSkinByCard,
        })
      : undefined;

  return (
    <Box sx={flipContainerSx(width)}>
      <Box sx={flip ? flipWrapperFlippedSx : flipWrapperSx}>
        <Box sx={{ ...frontCardSx, pointerEvents: flip ? "none" : "auto" }}>
          <GameCard {...props} width={width} />
        </Box>
        <Box sx={{ ...backCardSx, pointerEvents: flip ? "auto" : "none" }}>
          <GameCard
            {...props}
            width={width}
            card={BURNT_CARD}
            cardSkinId={undefined}
            cardSkinByCard={undefined}
            fallbackCardSkinId={undefined}
            inspectCardValue={props.card}
            inspectCardSkinId={inspectedBackCardSkinId}
            inspectFlip
          />
        </Box>
      </Box>
    </Box>
  );
};

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

// Export with original names
export const GameCard = memo(_GameCard);
export const FlipGameCard = memo(_FlipGameCard);
