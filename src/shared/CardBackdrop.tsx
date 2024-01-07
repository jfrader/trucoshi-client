import { BackdropProps, Box, CircularProgress } from "@mui/material";
import { PropsWithChildren } from "react";
import { Backdrop } from "./Backdrop";
import { ICard } from "trucoshi";
import { GameCard } from "../components/card/GameCard";
import { CardThemeToggle } from "../components/card/CardThemeToggle";
import { ITrucoshiActions, ITrucoshiState } from "../trucoshi/types";

type Props = PropsWithChildren<
  Pick<ITrucoshiActions, "inspectCard"> &
    Pick<ITrucoshiState, "cardsReady" | "cardTheme"> &
    Omit<BackdropProps, "open"> & { card: ICard | null }
>;

export const CardBackdrop = ({ card, cardsReady, cardTheme, inspectCard, ...props }: Props) => {
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
              <GameCard card={card} width="11em" />
            ) : (
              <GameCard card={card} width="11em" sx={{ zoom: '2.55' }} />
            )}
          </>
        ) : (
          <Box width="11em">
            <CircularProgress />
          </Box>
        )}
        <Box position="absolute" right="-3em" top="0">
          <CardThemeToggle />
        </Box>
      </Box>
    </Backdrop>
  );
};
