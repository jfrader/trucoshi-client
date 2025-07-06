import { Box, BoxProps, Button } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { EHandState, IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { useRounds } from "../../trucoshi/hooks/useRounds";
import { GameCard } from "../card/GameCard";
import { PropsWithPlayer } from "../../trucoshi/types";
import { HandCardContainer } from "../card/HandCardContainer";
import { getTeamColor } from "../../utils/team";
import { AnimatedBox } from "./PlayerTag";

type Props = PropsWithPlayer<
  {
    match: IPublicMatch;
    previousHand: IMatchPreviousHand | null;
    nextHand: () => void;
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

export const Rounds = ({ match, previousHand, nextHand, player, ...boxProps }: Props) => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [rounds] = useRounds(match, previousHand, nextHand);

  const playerCards = useMemo(
    () => rounds.flatMap((round) => round.filter((pc) => pc.player.idx === player.idx)),
    [player, rounds]
  );

  const florBattle = match.florBattle;
  const florBattlePlayer = florBattle?.playersWithFlor.find((p) => p.idx === player.idx);

  const overridePlayerCards = useMemo(() => {
    if (florBattlePlayer && florBattlePlayer.cards) {
      return (
        florBattlePlayer.cards.map((c) => ({
          card: c,
          key: c + "flor",
          player,
        })) || []
      );
    }

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
  }, [florBattlePlayer, player, playerCards, previousHand]);

  console.log({ florBattle, previousHand });

  return (
    <Box width="100%" height="100%" pt="33.3%" position="relative" right="0.9em" {...boxProps}>
      {florBattlePlayer && match.handState !== EHandState.WAITING_PLAY ? (
        <AnimatedBox
          infinite={1}
          isturn={Number(florBattle?.winner?.idx === player.idx)}
          sx={{
            top: "50%",
            left: "50%",
            position: "absolute",
          }}
        >
          <Button
            sx={{
              fontSize: "1rem",
            }}
            disableElevation
            disableRipple
            variant="contained"
            color={getTeamColor(player.teamIdx)}
          >
            {florBattlePlayer.points}
          </Button>
        </AnimatedBox>
      ) : null}
      <HandContainer margin="1px auto" px={4} position="relative" onHandOpen={setOpenHand}>
        {overridePlayerCards.map((pc, i) => {
          return (
            <HandCardContainer
              key={pc.key}
              i={i}
              cards={playerCards.length}
              open={Boolean(openHand)}
            >
              <GameCard
                shadow
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                zoom={Boolean(openHand)}
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
