import { Box, styled } from "@mui/material";

const OPEN_MARGIN = 4;
const getRotation = (seed: string, i: number, cards: number) => {
  const hash = Array.from(seed).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) | 0,
    0,
  );
  return (Math.abs(hash + i * 7 + cards * 11) % 7) - 3;
};
const getMargin = (i: number, cards: number, margin: number = OPEN_MARGIN) => {
  if (cards === 2) {
    const m = margin / 2;
    return i === 0 ? -m + "em" : m + "em";
  }

  const mid = Math.floor(cards / 2);

  if (i < mid) {
    return `-${margin * (mid - i)}em`;
  }

  if (i > mid) {
    return `${margin * (i - mid)}em`;
  }

  return 0;
};

export const HandCardContainer = styled(Box, {
  shouldForwardProp(propName) {
    return ![
      "open",
      "cards",
      "i",
      "openMargin",
      "margin",
      "rotationSeed",
      "centered",
    ].includes(propName as string);
  },
})<{
  open: boolean;
  cards: number;
  i: number;
  openMargin?: number;
  margin?: number;
  rotationSeed?: string;
  centered?: boolean;
}>(({
  theme,
  open,
  cards,
  i,
  openMargin: openMarginProp = OPEN_MARGIN,
  margin = 1,
  rotationSeed = `${cards}-${i}`,
  centered = false,
}) => {
  const openMargin = getMargin(i, cards, openMarginProp);
  const closedMargin = getMargin(i, cards, margin);
  const rotation = getRotation(rotationSeed, i, cards);
  const transform = `${centered ? "translateX(-50%) " : ""}rotate(${rotation}deg)`;
  return [
    {
      position: "absolute",
      left: "50%",
      right: centered ? "auto" : "50%",
      width: centered ? "max-content" : undefined,
      transform,
      marginLeft: closedMargin,
      transition: theme.transitions.create(["transform", "margin-top", "margin-left"], {
        duration: theme.transitions.duration.standard,
      }),
    },
    open
      ? {
          transform,
          marginLeft: openMargin,
          zIndex: theme.zIndex.appBar + 2,
          "& *": {
            zIndex: theme.zIndex.appBar + 2,
          },
        }
      : {
          zIndex: theme.zIndex.appBar + 1,
          "& *": {
            zIndex: theme.zIndex.appBar + 1,
          },
        },
  ];
});
