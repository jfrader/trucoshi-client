import { BackdropProps, Box, IconButton, Stack, styled } from "@mui/material";
import { PropsWithChildren, SetStateAction, useEffect, useState } from "react";
import { Backdrop } from "./Backdrop";
import { ICard } from "trucoshi";
import { FlipGameCard } from "../components/card/GameCard";
import { ITrucoshiActions } from "../trucoshi/types";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSound } from "../sound/hooks/useSound";

type Props = PropsWithChildren<
  Pick<ITrucoshiActions, "inspectCard"> &
    Omit<BackdropProps, "open"> & { card: ICard | null }
>;

const StyledBackdrop = styled(Backdrop)({});

export const CardBackdrop = ({ card, inspectCard, ...props }: Props) => {
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
        <FlipGameCard card={card} width="17em" flip={flip} />
        <Stack gap={2} alignItems="center" position="absolute" right="-1.8em" top="0">
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
