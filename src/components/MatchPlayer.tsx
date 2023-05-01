import { Box, Button, ButtonGroup, LinearProgress, Typography } from "@mui/material";
import { ICard, IPublicPlayer } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, ITrucoshiMatchState } from "../trucoshi/types";
import { GameCard } from "./GameCard";
import { PlayerTag } from "./PlayerTag";
import { DANGEROUS_COMMANDS, COMMANDS_HUMAN_READABLE } from "../trucoshi/constants";
import { useTurnTimer } from "../trucoshi/hooks/useTurnTimer";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

type PlayerProps = Pick<ITrucoshiMatchState, "canPlay" | "canSay" | "previousHand" | "match"> & {
  player: IPublicPlayer;
  onPlayCard: ITrucoshiMatchActions["playCard"];
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
};

export const MatchPlayer = ({
  match,
  previousHand,
  player,
  canSay,
  canPlay,
  onPlayCard,
  onSayCommand,
}: PlayerProps) => {
  const [{ serverAheadTime }] = useTrucoshi();

  const [, isPrevious] = useRounds(match, previousHand);

  const bestEnvido = Math.max(...(player.envido || []));

  const turnTimer = useTurnTimer(player, serverAheadTime, match?.options);

  return (
    <Box flexGrow={1} display="flex" flexDirection="column">
      <Box maxWidth="100%" pt={1} display="flex" flexDirection="column" flexGrow={1} height="100%">
        <PlayerTag
          disabled={!player.ready || player.disabled}
          player={player}
          isTurn={player.isTurn}
        />
        {player.abandoned ? (
          <Box pt={1}>
            <Typography color="text.disabled">Retirado</Typography>
          </Box>
        ) : (
          <Box pt={1} minHeight="4em">
            {!isPrevious &&
              player.hand.map((card, idx) =>
                canPlay && player.isMe && player.isTurn ? (
                  <GameCard
                    enableHover
                    key={card + idx}
                    card={card as ICard}
                    onClick={() => onPlayCard(idx, card as ICard)}
                  />
                ) : (
                  <GameCard key={card + idx} card={card as ICard} />
                )
              )}
          </Box>
        )}
        {!player.abandoned && player.isMe && canSay && !isPrevious ? (
          <Box
            pt={1}
            bgcolor="background.paper"
            justifySelf="end"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <ButtonGroup sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
              {player.commands.map((command) => (
                <Button
                  key={command}
                  onClick={() => onSayCommand(command)}
                  size="small"
                  variant="text"
                  color={DANGEROUS_COMMANDS.includes(command) ? "error" : "success"}
                >
                  {COMMANDS_HUMAN_READABLE[command]}
                </Button>
              ))}
              {player.isEnvidoTurn &&
                player.envido.map((points) => (
                  <Button
                    key={points}
                    onClick={() => onSayCommand(points)}
                    size="small"
                    variant="text"
                    color={bestEnvido === points ? "success" : "error"}
                  >
                    {points}
                  </Button>
                ))}
            </ButtonGroup>
          </Box>
        ) : null}
      </Box>
      <LinearProgress
        sx={{
          visibility: player.isTurn && !previousHand && turnTimer.progress ? "visible" : "hidden",
        }}
        variant="determinate"
        color={turnTimer.isExtension ? "error" : "success"}
        value={turnTimer.progress}
      />
    </Box>
  );
};
