import { Box, Button, ButtonProps, styled } from "@mui/material";
import { ReactNode } from "react";
import { ICard } from "trucoshi";

export const GameCard = ({
  card,
  enableHover,
  ...buttonProps
}: {
  card: string | ICard | ReactNode;
  enableHover?: boolean;
} & ButtonProps) => {
  return (
    <GameCardButton variant="contained" enablehover={enableHover ? 1 : 0} {...buttonProps}>
      {card}
    </GameCardButton>
  );

  // return (
  //   <img
  //     style={{ objectFit: "contain", margin: "0.1em", width: "75px", height: "110px" }}
  //     src="/3b.svg"
  //   />
  // );
};

const GameCardButton = styled(Button)<{ enablehover?: boolean | number }>(
  ({ theme, enablehover }) => [
    {
      minWidth: 0,
      padding: "1.6rem 1rem",
      transition: theme.transitions.create(["transform"], {
        duration: theme.transitions.duration.standard,
      }),
    },
    enablehover
      ? {
          "&:hover": {
            zIndex: 1911,
            transform: "scale(1.4)",
            "& *": {
              zIndex: 1911,
            }
          },
        }
      : {},
  ]
);

export const GameCardContainer = styled(Box)<{ open: boolean; cards: number; i: number }>(
  ({ theme, open, cards, i }) => {
    const randDeg = () => Math.round(Math.random() * 4) * (Math.random() > 0.5 ? 1 : -1);
    const margin = 7 * i + "px";
    const openMargin =
      cards > 1 && i % 2 === 0 ? `calc((7px * ${i}) ${i === 0 ? "- 2.68" : "+ 2"}rem)` : 0;

    return [
      {
        position: "absolute",
        left: "50%",
        right: "50%",
        transform: `rotate(${randDeg()}deg)`,
        marginTop: i !== undefined ? margin : 0,
        marginLeft: i !== undefined ? margin : 0,
        transition: theme.transitions.create(["transform", "margin-top", "margin-left"], {
          duration: theme.transitions.duration.standard,
        }),
      },
      open
        ? {
            transform: `rotate(${randDeg()}deg) scale(1.5)`,
            marginTop: 0,
            marginLeft: openMargin,
            zIndex: 1911 + " !important",
            "& *": {
              zIndex: 1911,
            }
          }
        : {
          zIndex: 1910,
          "& *": {
            zIndex: 1910,
          }
        },
    ];
  }
);
