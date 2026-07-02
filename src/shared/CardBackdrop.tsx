import {
  BackdropProps,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  styled,
} from "@mui/material";
import { PropsWithChildren, SetStateAction, useEffect, useState } from "react";
import { Backdrop } from "./Backdrop";
import { FlipGameCard } from "../components/card/GameCard";
import { ITrucoshiActions, ITrucoshiState } from "../trucoshi/types";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSound } from "../sound/hooks/useSound";
import { InventoryButton } from "../components/card/InventoryButton";
import { IInspectedCard } from "../trucoshi/cards/cardInspection";
import { ResultCardLabel } from "../components/treasure/TreasureChestPanel.styles";
import { CARDS_HUMAN_READABLE } from "trucoshi";

type Props = PropsWithChildren<
  Pick<ITrucoshiActions, "inspectCard"> &
    Pick<ITrucoshiState, "cardsReady"> &
    Omit<BackdropProps, "open"> & { card: IInspectedCard | null }
>;

const StyledBackdrop = styled(Backdrop)({});

export const CardBackdrop = ({ card, cardsReady, inspectCard, ...props }: Props) => {
  const { queue } = useSound();
  const [flip, _setFlip] = useState(false);

  const setFlip = (v: SetStateAction<boolean>) => {
    const rndSound = Math.round(Math.random() * 2);
    queue("play" + rndSound);
    _setFlip(v);
  };

  useEffect(() => {
    const rndSound = Math.round(Math.random() * 2);
    queue("play" + rndSound);
    _setFlip(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!card) {
    return null;
  }
  return (
    <StyledBackdrop {...props} open={Boolean(card)} onClick={() => inspectCard(null)}>
      <Box
        position="relative"
        bottom="6em"
        width="17em"
        minHeight="15em"
        onClick={(e) => e.stopPropagation()}
      >
        {cardsReady ? (
          <FlipGameCard
            card={card.card}
            width="17em"
            flip={flip}
            cardSkinId={card.cardSkinId}
            displayMode={card.displayMode}
          />
        ) : (
          <Box width="17em">
            <CircularProgress />
          </Box>
        )}
        <Stack gap={2} alignItems="center" position="absolute" right="-1.8em" top="0">
          <ResultCardLabel summarySize="compact">
            {card && CARDS_HUMAN_READABLE[card.card]}
          </ResultCardLabel>
          <Divider />
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
          <InventoryButton />
        </Stack>
      </Box>
    </StyledBackdrop>
  );
};
