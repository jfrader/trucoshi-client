import { Box, Button, ButtonProps, styled } from "@mui/material";
import { CARDS_HUMAN_READABLE, ICard } from "trucoshi";

export const GameCard = ({
  children,
  card,
  enableHover,
  ...buttonProps
}: {
  card: ICard;
  enableHover?: boolean;
} & ButtonProps) => {
  const hasPic = card.charAt(1) === "b";

  if (hasPic) {
    return (
      <GameCardButton
        variant="card"
        name={card || "xx"}
        enablehover={enableHover ? 1 : 0}
        {...buttonProps}
      >
        <img
          alt={CARDS_HUMAN_READABLE[card] || "Carta quemada"}
          style={{
            objectFit: "contain",
            width: "4.4em",
          }}
          src={`/cards/default/${card}.png`}
        />
      </GameCardButton>
    );
  }

  return (
    <GameCardButton
      variant="emojicard"
      name={card || "xx"}
      emojicard={1}
      enablehover={enableHover ? 1 : 0}
      {...buttonProps}
    >
      <Box>{CARDS_HUMAN_READABLE[card] || <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}</Box>
    </GameCardButton>
  );

  // return (
  //   <img
  //     style={{ objectFit: "contain", margin: "0.1em", width: "75px", height: "110px" }}
  //     src="/3b.svg"
  //   />
  // );
};

const GameCardButton = styled(Button)<{
  enablehover?: boolean | number;
  emojicard?: boolean | number;
}>(({ theme, enablehover, emojicard }) => [
  {
    transition: theme.transitions.create(["transform"], {
      duration: theme.transitions.duration.standard,
    }),
  },
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
          zIndex: 1911,
          transform: "scale(1.4)",
          "& *": {
            zIndex: 1911,
          },
        },
      }
    : {},
]);

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
            },
          }
        : {
            zIndex: 1910,
            "& *": {
              zIndex: 1910,
            },
          },
    ];
  }
);
