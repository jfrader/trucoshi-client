import { BackdropProps, Box, CircularProgress, Stack, Switch } from "@mui/material";
import { PropsWithChildren, useEffect, useState } from "react";
import { Backdrop } from "./Backdrop";
import { ICard } from "trucoshi";
import { FlipGameCard } from "../components/card/GameCard";
import { CardThemeToggle } from "../components/card/CardThemeToggle";
import { ITrucoshiActions, ITrucoshiState } from "../trucoshi/types";

type Props = PropsWithChildren<
  Pick<ITrucoshiActions, "inspectCard"> &
    Pick<ITrucoshiState, "cardsReady" | "cardTheme"> &
    Omit<BackdropProps, "open"> & { card: ICard | null }
>;

export const CardBackdrop = ({ card, cardsReady, cardTheme, inspectCard, ...props }: Props) => {
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    setFlip(false);
  }, [card]);

  if (!card) {
    return null;
  }
  return (
    <Backdrop {...props} open={Boolean(card)} onClick={() => inspectCard(null)}>
      <Box
        position="relative"
        bottom="6em"
        width="11em"
        minHeight="15em"
        onClick={(e) => e.stopPropagation()}
      >
        {cardsReady ? (
          <>
            {cardTheme ? (
              <FlipGameCard card={card} width="11em" flip={flip} />
            ) : (
              <FlipGameCard card={card} width="11em" sx={{ zoom: "2.55" }} flip={flip} />
            )}
          </>
        ) : (
          <Box width="11em">
            <CircularProgress />
          </Box>
        )}
        <Stack gap={2} position="absolute" right="-3em" top="0">
          <CardThemeToggle />
          <Switch
            title="Dorso"
            color="info"
            size="small"
            checked={flip}
            onChange={(_e, checked) => setFlip(checked)}
          />
        </Stack>
      </Box>
    </Backdrop>
  );
};
