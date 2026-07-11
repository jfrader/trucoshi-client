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
import { ITrucoshiActions } from "../trucoshi/types";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSound } from "../sound/hooks/useSound";
import { InventoryButton } from "../components/card/InventoryButton";
import { IInspectedCard } from "../trucoshi/cards/cardInspection";
import { ResultCardLabel } from "../components/treasure/TreasureChestPanel.styles";
import { CARDS_HUMAN_READABLE } from "trucoshi";
import {
  getCardImageRequestSources,
  useCardImagePreload,
} from "../trucoshi/cards/cardImageLoader";
import { CardDisplayMode } from "../trucoshi/cards/cardSkinResolver";

type Props = PropsWithChildren<
  Pick<ITrucoshiActions, "inspectCard"> &
    Omit<BackdropProps, "open"> & {
      card: IInspectedCard | null;
      displayMode?: CardDisplayMode;
    }
>;

const StyledBackdrop = styled(Backdrop)({});

export const CardBackdrop = ({ card, displayMode = "skins", inspectCard, ...props }: Props) => {
  const { queue } = useSound();
  const [flip, _setFlip] = useState(() => Boolean(card?.flip));
  const effectiveDisplayMode = card?.displayMode || displayMode;
  const preload = useCardImagePreload(
    card
      ? getCardImageRequestSources({
          card: card.card,
          cardSkinId: card.cardSkinId,
          displayMode: effectiveDisplayMode,
        })
      : [],
    !card || effectiveDisplayMode === "emoji",
  );

  const setFlip = (v: SetStateAction<boolean>) => {
    const rndSound = Math.round(Math.random() * 2);
    queue("play" + rndSound);
    _setFlip(v);
  };

  useEffect(() => {
    if (card) {
      _setFlip(Boolean(card.flip));
    }
  }, [card]);

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
        {effectiveDisplayMode === "emoji" || preload.ready ? (
          <FlipGameCard
            card={card.card}
            width="17em"
            flip={flip}
            cardSkinId={card.cardSkinId}
            displayMode={effectiveDisplayMode}
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
