import { Box, BoxProps } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { useRounds } from "../../trucoshi/hooks/useRounds";
import { GameCard } from "../card/GameCard";
import { PropsWithPlayer } from "../../trucoshi/types";
import { HandCardContainer } from "../card/HandCardContainer";

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
    () => rounds.flatMap((round) => round.filter((pc) => pc.player.idx === player.idx)),
    [player, rounds]
  );

  return (
    <Box width="100%" height="100%" pt="30%" position="relative" right="0.9em" {...boxProps}>
      <HandContainer margin="0 auto" px={4} position="relative" onHandOpen={setOpenHand}>
        {playerCards.map((pc, i) => {
          return (
            <HandCardContainer key={pc.key} i={i} cards={playerCards.length} open={openHand}>
              <GameCard
                burn={player.disabled}
                shadow
                zoom={openHand}
                width={match.players.length > 4 ? undefined : "5em"}
                {...pc}
              />
            </HandCardContainer>
          );
        })}
      </HandContainer>
    </Box>
  );
};
