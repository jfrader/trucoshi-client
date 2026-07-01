import { Box, BoxProps, Button } from "@mui/material";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { EHandState, ICard, IPlayedCard, IPublicMatch, IPublicPlayer } from "trucoshi";
import { useRounds } from "../../trucoshi/hooks/useRounds";
import { GameCard } from "../card/GameCard";
import { PropsWithPlayer } from "../../trucoshi/types";
import { HandCardContainer } from "../card/HandCardContainer";
import { getTeamColor } from "../../utils/team";
import { AnimatedBox } from "./PlayerTag";
import { memo } from "react";

const containerSx = {
  width: "100%",
  height: "100%",
  pt: "29%",
  position: "relative",
  right: "1.4em",
};

const florButtonContainerSx = (hasFlor: boolean, hasCards: boolean) => ({
  top: "50%",
  left: "50%",
  position: "absolute",
  zIndex: (theme: any) => theme.zIndex.snackbar,
  pointerEvents: "none",
  opacity: hasCards ? 0.85 : 1,
  display: hasFlor ? "block" : "none",
});

const florButtonInnerSx = {
  fontSize: "1rem",
};

const handContainerSx = {
  margin: "1px auto",
  px: 4,
  position: "relative",
};

const WIDTH_MAP: Record<number, string> = {
  2: "5.8em",
  4: "5em",
  6: "4.4em",
};

type Props = PropsWithPlayer<
  {
    match: IPublicMatch;
  } & Pick<BoxProps, "onMouseEnter" | "onMouseLeave" | "sx">
>;

const concatCards = (
  playerCards: IPlayedCard[],
  cards: ICard[],
  player: IPublicPlayer
): IPlayedCard[] => {
  const set = new Set([...playerCards.map((pc) => pc.card), ...cards]);
  return Array.from(set).map((card) => ({
    card,
    key: `${card}-${player.idx}`,
    player,
    cardSkinId: player.deckSkinByCard?.[card],
  }));
};

export const HandContainer = memo(
  ({ onHandOpen, ...props }: BoxProps & { onHandOpen: Dispatch<SetStateAction<boolean>> }) => (
    <Box
      sx={handContainerSx}
      onMouseEnter={() => onHandOpen(true)}
      onMouseLeave={() => onHandOpen(false)}
      onClick={() => onHandOpen((current) => !current)}
      {...props}
    />
  )
);
HandContainer.displayName = "HandContainer";

export const Rounds = memo(({ match, player, ...boxProps }: Props) => {
  const [openHand, setOpenHand] = useState<boolean>(false);
  const [rounds] = useRounds(match);
  const previousHand = match.previousHand;

  const playerCards = useMemo(() => {
    const baseCards = rounds
      .flatMap((round) => round.filter((pc) => pc.player.idx === player.idx))
      .map((pc) => ({ ...pc, key: `${pc.card}-${player.idx}` }));

    const florBattle = match.florBattle;
    const florBattlePlayer = florBattle?.playersWithFlor.find((p) => p.idx === player.idx);

    if (florBattlePlayer?.cards) {
      return concatCards(baseCards, florBattlePlayer.cards, player);
    }

    const findPreviousFlor =
      player.hasSaidFlor &&
      previousHand?.flor &&
      previousHand.flor.data.find(({ idx }) => idx === player.idx);

    if (findPreviousFlor) {
      return concatCards(baseCards, findPreviousFlor.cards, player);
    }

    if (previousHand?.envido?.data?.cards && previousHand.envido.winner.key === player.key) {
      return concatCards(baseCards, previousHand.envido.data.cards, player);
    }

    return baseCards;
  }, [rounds, match.florBattle, player, previousHand]);

  const autoOpenHand = useMemo(
    () =>
      Boolean(
        match.florBattle?.playersWithFlor.find((p) => p.idx === player.idx)?.cards ||
          previousHand?.flor?.data.find((p) => p.idx === player.idx) ||
          (previousHand?.envido?.data?.cards && previousHand.envido.winner.idx === player.idx)
      ),
    [match.florBattle, previousHand?.flor, previousHand?.envido, player.idx]
  );

  const cardWidth = WIDTH_MAP[match.players.length] || WIDTH_MAP[4];

  const hasFlor = match.florBattle?.playersWithFlor.find((p) => p.idx === player.idx);
  const hasFlorBattleCards = !!hasFlor?.cards;

  return (
    <Box sx={containerSx} {...boxProps}>
      {match.florBattle && match.handState !== EHandState.WAITING_PLAY && (
        <AnimatedBox
          infinite={1}
          isturn={Number(match.florBattle.winner?.idx === player.idx)}
          sx={florButtonContainerSx(!!hasFlor, hasFlorBattleCards)}
        >
          <Button
            sx={florButtonInnerSx}
            disableElevation
            disableRipple
            variant="contained"
            color={getTeamColor(player.teamIdx)}
          >
            {match.florBattle.playersWithFlor.find((p) => p.idx === player.idx)?.points}
          </Button>
        </AnimatedBox>
      )}
      <HandContainer onHandOpen={setOpenHand}>
        {playerCards.map(({ key, ...pc }, i) => (
          <HandCardContainer
            key={key}
            i={i}
            margin={1.2}
            cards={playerCards.length}
            open={openHand || autoOpenHand}
          >
            <GameCard
              shadow
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              zoom={openHand}
              width={cardWidth}
              {...pc}
            />
          </HandCardContainer>
        ))}
      </HandContainer>
    </Box>
  );
});

Rounds.displayName = "Rounds";
