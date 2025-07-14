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
          key: c + player.idx,
          player,
        })) || []
      );
    }

    const findPreviousFlor =
      previousHand?.flor && previousHand.flor.data.find(({ idx }) => idx === player.idx);

    if (findPreviousFlor) {
      return findPreviousFlor.cards.map((card) => ({ card, key: card + "flor", player }));
    }

    if (previousHand?.envido?.data?.cards && previousHand.envido.winner.key === player.key) {
      return [
        ...playerCards.filter((pc) => !previousHand.envido?.data?.cards.includes(pc.card)),
        ...(previousHand.envido.data.cards.map((c) => ({
          card: c,
          key: c + player.idx,
          player,
        })) || []),
      ];
    }

    return playerCards;
  }, [florBattlePlayer, player, playerCards, previousHand]);

  const autoOpenHand =
    (florBattlePlayer && florBattlePlayer.cards) ||
    previousHand?.flor?.data.find((p) => p.idx === player.idx) ||
    (previousHand?.envido?.data?.cards && previousHand?.envido?.winner.idx === player.idx);

  return (
    <Box width="100%" height="100%" pt="29%" position="relative" right="1.4em" {...boxProps}>
      {florBattlePlayer && match.handState !== EHandState.WAITING_PLAY ? (
        <AnimatedBox
          infinite={1}
          isturn={Number(florBattle?.winner?.idx === player.idx)}
          sx={(theme: any) => ({
            top: "50%",
            left: "50%",
            position: "absolute",
            opacity: florBattlePlayer.cards ? 0.85 : 1,
            zIndex: theme.zIndex.snackbar,
            pointerEvents: "none",
          })}
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
              cards={overridePlayerCards.length}
              open={Boolean(openHand || autoOpenHand)}
            >
              <GameCard
                shadow
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                zoom={Boolean(openHand)}
                width={WIDTH_MAP[match.players.length || 4]}
                {...pc}
              />
            </HandCardContainer>
          );
        })}
      </HandContainer>
    </Box>
  );
};

const WIDTH_MAP: Record<number, string> = {
  2: "5.8em",
  4: "5em",
  6: "4.4em",
};
