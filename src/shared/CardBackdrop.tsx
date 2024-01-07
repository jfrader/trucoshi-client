import {
  BackdropProps,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  styled,
} from "@mui/material";
import { PropsWithChildren, useEffect, useState } from "react";
import { Backdrop } from "./Backdrop";
import { ICard } from "trucoshi";
import { FlipGameCard } from "../components/card/GameCard";
import { CardThemeToggle } from "../components/card/CardThemeToggle";
import { ITrucoshiActions, ITrucoshiState } from "../trucoshi/types";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type Props = PropsWithChildren<
  Pick<ITrucoshiActions, "inspectCard"> &
    Pick<ITrucoshiState, "cardsReady" | "cardTheme"> &
    Omit<BackdropProps, "open"> & { card: ICard | null }
>;

const StyledBackdrop = styled(Backdrop)({});

export const CardBackdrop = ({ card, cardsReady, cardTheme, inspectCard, ...props }: Props) => {
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    setFlip(false);
  }, [card]);

  if (!card) {
    return null;
  }
  return (
    <StyledBackdrop {...props} open={Boolean(card)} onClick={() => inspectCard(null)}>
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
              <FlipGameCard card={card} width="13em" flip={flip} />
            ) : (
              <FlipGameCard card={card} width="13em" sx={{ zoom: "2.9" }} flip={flip} />
            )}
          </>
        ) : (
          <Box width="11em">
            <CircularProgress />
          </Box>
        )}
        <Stack gap={2} position="absolute" right="-4em" top="0">
          <CardThemeToggle />
          <IconButton
            title={flip ? "Revelar" : "Ocultar"}
            onClick={(e) => {
              e.stopPropagation();
              setFlip((c) => !c);
            }}
            color="success"
          >
            {flip ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Stack>
      </Box>
    </StyledBackdrop>
  );
};
