import { Box, Typography } from "@mui/material";
import { ICard } from "trucoshi";
import { useRounds } from "../../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, ITrucoshiMatchState, PropsWithPlayer } from "../../trucoshi/types";
import { GameCard } from "../card/GameCard";
import { PlayerTag } from "./PlayerTag";
import { TurnProgress } from "./TurnProgress";

type PlayerProps = Pick<ITrucoshiMatchState, "canPlay" | "previousHand" | "match"> &
  PropsWithPlayer<{
    onPlayCard: ITrucoshiMatchActions["playCard"];
  }>;

const MatchPlayer = ({ match, previousHand, player, canPlay, onPlayCard }: PlayerProps) => {
  const [, isPrevious] = useRounds(match, previousHand);

  return (
    <Box flexGrow={1} display="flex" flexDirection="column">
      <TurnProgress match={match} player={player} previousHand={previousHand} />
      <Box maxWidth="100%" pt={1} display="flex" flexDirection="column" flexGrow={1} height="100%">
        <PlayerTag
          disabled={!player.ready || player.disabled}
          player={player}
          isTurn={!isPrevious && player.isTurn}
        />
        {player.abandoned ? (
          <Box pt={1}>
            <Typography color="text.disabled">Retirado</Typography>
          </Box>
        ) : (
          <>
            {player.disabled ? (
              <Box pt={1}>
                <Typography color="text.disabled">Al mazo</Typography>
              </Box>
            ) : (
              <Box pt={1} minHeight="4em">
                {!isPrevious &&
                  !player.disabled &&
                  player.hand.map((card, idx) =>
                    canPlay && player.isMe && player.isTurn ? (
                      <GameCard
                        enableHover
                        key={card + player.idx}
                        card={card as ICard}
                        onClick={() => onPlayCard(idx, card as ICard)}
                      />
                    ) : (
                      <GameCard key={card + player.idx} card={card as ICard} />
                    )
                  )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

MatchPlayer.whyDidYouRender = true;

export { MatchPlayer };
