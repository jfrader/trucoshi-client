import { Box, BoxProps } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { GameCard } from "./GameCard";
import { PropsWithPlayer } from "../trucoshi/types";
import { HandCardContainer } from "./HandCardContainer";

type Props = PropsWithPlayer<
  {
    match: IPublicMatch;
    previousHand: IMatchPreviousHand | null;
    previousHandCallback: () => void;
  } & Pick<BoxProps, "onMouseEnter" | "onMouseLeave" | "sx">
>;

export const HandContainer = ({
  onHandOpen,
  ...props
}: BoxProps & { onHandOpen: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <Box
      onMouseEnter={() => {
        onHandOpen(true);
      }}
      onMouseLeave={() => {
        onHandOpen(false);
      }}
      onClick={() => {
        onHandOpen((current) => !current);
      }}
      {...props}
    />
  );
};

export const Rounds = ({
  match,
  previousHand,
  previousHandCallback,
  player,
  ...boxProps
}: Props) => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [rounds] = useRounds(match, previousHand, previousHandCallback);

  const playerCards = useMemo(
    () => rounds.flatMap((round) => round.filter((pc) => pc.player.key === player.key)),
    [player, rounds]
  );

  return (
    <Box width="100%" height="100%" pt="30%" position="relative" right="0.9em" {...boxProps}>
      <HandContainer margin="0 auto" px={4} position="relative" onHandOpen={setOpenHand}>
        {playerCards.map((pc, i) => {
          return (
            <HandCardContainer key={pc.key} i={i} cards={playerCards.length} open={openHand}>
              <GameCard shadow zoom={openHand} {...pc} />
            </HandCardContainer>
          );
        })}
      </HandContainer>
    </Box>
  );
};
