import { Box, styled } from "@mui/material";
import { memo } from "react";

const OPEN_MARGIN = 4;
const randDeg = () => Math.round(Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1);
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

const Component = styled(Box)<{
  open: boolean;
  cards: number;
  i: number;
  openMargin?: number;
  margin?: number;
}>(({ theme, open, cards, i, openMargin: openMarginProp = OPEN_MARGIN, margin = 1 }) => {
  const openMargin = getMargin(i, cards, openMarginProp);
  const closedMargin = getMargin(i, cards, margin);
  return [
    {
      position: "absolute",
      left: "50%",
      right: "50%",
      transform: `rotate(${randDeg()}deg)`,
      marginLeft: closedMargin,
      transition: theme.transitions.create(["transform", "margin-top", "margin-left"], {
        duration: theme.transitions.duration.standard,
      }),
    },
    open
      ? {
          transform: `rotate(${randDeg()}deg)`,
          marginLeft: openMargin,
          zIndex: theme.zIndex.appBar - 1,
          "& *": {
            zIndex: theme.zIndex.appBar - 1,
          },
        }
      : {
          zIndex: theme.zIndex.appBar - 2,
          "& *": {
            zIndex: theme.zIndex.appBar - 2,
          },
        },
  ];
});

export const HandCardContainer = memo(Component, (prev, next) => {
  return prev.cards === next.cards && prev.i === next.i && prev.open === next.open;
});
