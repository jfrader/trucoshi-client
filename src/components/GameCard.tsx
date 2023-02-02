import { Button, ButtonProps } from "@mui/material";
import { ReactNode } from "react";
import { ICard, IPlayedCard } from "trucoshi";

export const GameCard = ({
  key,
  card,
  ...buttonProps
}: Omit<IPlayedCard, "player" | "card"> & {
  card: string | ICard | ReactNode;
} & ButtonProps) => {
  return (
    <Button
      variant="contained"
      key={key}
      {...buttonProps}
      sx={{
        margin: "0.2em",
        padding: "2.5em 0",
        ...(buttonProps.sx || {}),
      }}
    >
      {card}
    </Button>
  );

  // return (
  //   <img
  //     style={{ objectFit: "contain", margin: "0.1em", width: "75px", height: "110px" }}
  //     src="/3b.svg"
  //   />
  // );
};
