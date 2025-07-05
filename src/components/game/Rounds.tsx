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

  const overridePlayerCards = useMemo(() => {
    if (previousHand?.envido && previousHand.envido.winner.key === player.key) {
      return [
        ...playerCards,
        ...(previousHand.envido.data?.cards
          .filter((c) => !playerCards.map((c) => c.card).includes(c))
          .map((c) => ({
            card: c,
            key: c + "envido",
            player,
          })) || []),
      ];
    }

    const findPreviousFlor =
      previousHand?.flor && previousHand.flor.data.find(({ idx }) => idx === player.idx);

    if (findPreviousFlor) {
      return findPreviousFlor.cards.map((card) => ({ card, key: card + "flor", player }));
    }

    return playerCards;
  }, [player, playerCards, previousHand]);

  return (
    <Box width="100%" height="100%" pt="33.3%" position="relative" right="0.9em" {...boxProps}>
      <HandContainer margin="1px auto" px={4} position="relative" onHandOpen={setOpenHand}>
        {overridePlayerCards.map((pc, i) => {
          return (
            <HandCardContainer key={pc.key} i={i} cards={playerCards.length} open={openHand}>
              <GameCard
                shadow
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                zoom={openHand}
                width={match.players.length > 4 ? undefined : "5.2em"}
                {...pc}
              />
            </HandCardContainer>
          );
        })}
      </HandContainer>
    </Box>
  );
};
