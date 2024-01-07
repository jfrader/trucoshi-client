import { Box, styled } from "@mui/material";

const OPEN_MARGIN = 4;
const randDeg = () => Math.round(Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1);
const getMargin = (i: number, cards: number) => {
  if (cards === 2) {
    const m = OPEN_MARGIN / 2;
    return i === 0 ? -m + "em" : m + "em";
  }

  const mid = Math.floor(cards / 2);

  if (i < mid) {
    return `-${OPEN_MARGIN * (mid - i)}em`;
  }

  if (i > mid) {
    return `${OPEN_MARGIN * (i - mid)}em`;
  }

  return 0;
};

export const HandCardContainer = styled(Box)<{ open: boolean; cards: number; i: number }>(
  ({ theme, open, cards, i }) => {
    const margin = 8 * i + "px";
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
  }
);
