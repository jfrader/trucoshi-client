import { Button, ButtonProps } from "@mui/material";
import { ReactNode } from "react";
import { ICard, IPlayedCard } from "trucoshi/dist/lib/types";

export const GameCard = ({
  key,
  card,
  i,
  ...buttonProps
}: Omit<IPlayedCard, "player" | "card"> & {
  i?: number;
  card: string | ICard | ReactNode;
} & ButtonProps) => {
  return (
    <Button
      key={key}
      sx={{
        ...(buttonProps.sx || {}),
        margin: "0.2em",
        padding: "2.5em 0",
        position: "relative",
        top: i ? `calc(8px * ${i})` : undefined,
        left: i ? `calc(8px * ${i})` : undefined,
      }}
      {...buttonProps}
    >
      {card}
    </Button>
  );

  // return (
  //   <img
  //     style={{ objectFit: "contain", margin: "0.1em", width: "64px", height: "94px" }}
  //     src="/3b.svg"
  //   />
  // );
};
