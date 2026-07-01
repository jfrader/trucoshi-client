import { Box, Typography } from "@mui/material";
import { EFlorCommand, ICard, IChatMessage, IPublicMatch } from "trucoshi";
import { useRounds } from "../../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, PropsWithPlayer } from "../../trucoshi/types";
import { GameCard } from "../card/GameCard";
import { PlayerTag } from "./PlayerTag";
import { TurnProgress } from "./TurnProgress";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import { useTurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

type PlayerProps = PropsWithPlayer<{
  onPlayCard: ITrucoshiMatchActions["playCard"];
  say: IChatMessage | null;
  match: IPublicMatch | null;
  canPlay: boolean;
}>;

const MatchPlayer = ({ match, player, say, canPlay, onPlayCard }: PlayerProps) => {
  const [{ serverAheadTime }] = useTrucoshi();
  const [, isPrevious] = useRounds(match);

  const turnTimer = useTurnTimer(player, serverAheadTime, match);
  const modal = useConfirmationModal();

  return (
    <Box flexGrow={1} display="flex" flexDirection="column">
      <TurnProgress
        turnTimer={turnTimer}
        visible={
          player.bot
            ? Boolean(player.isTurn && !match?.previousHand)
            : Boolean(player.isTurn && !match?.previousHand && turnTimer.progress)
        }
      />
      <Box maxWidth="100%" pt={1} display="flex" flexDirection="column" flexGrow={1} height="100%">
        <PlayerTag
          player={player}
          say={say}
          isDisabled={!player.ready || player.disabled}
          isTurn={!isPrevious && player.isTurn}
          isForehand={player.idx === match?.forehandIdx}
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
                        cardSkinByCard={player.deckSkinByCard}
                        onClick={() => {
                          if (player.commands.includes(EFlorCommand.FLOR)) {
                            return modal.onOpen({
                              title: "Atencion",
                              body: "Si jugas esta carta vas a perder tu flor!",
                              acceptLabel: "Jugar de todas formas",
                              onConfirm: () => {
                                onPlayCard(idx, card as ICard);
                              },
                            });
                          }
                          onPlayCard(idx, card as ICard);
                        }}
                      />
                    ) : (
                      <GameCard
                        key={idx}
                        card={card as ICard}
                        cardSkinByCard={player.deckSkinByCard}
                      />
                    )
                  )}
              </Box>
            )}
          </>
        )}
      </Box>
      <ConfirmationModal {...modal} />
    </Box>
  );
};

MatchPlayer.whyDidYouRender = true;

export { MatchPlayer };
