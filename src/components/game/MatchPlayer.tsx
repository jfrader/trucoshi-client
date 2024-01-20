import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { ICard } from "trucoshi";
import { useRounds } from "../../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, ITrucoshiMatchState, PropsWithPlayer } from "../../trucoshi/types";
import { GameCard } from "../card/GameCard";
import { PlayerTag } from "./PlayerTag";
import { DANGEROUS_COMMANDS, COMMANDS_HUMAN_READABLE } from "../../trucoshi/constants";
import { TurnProgress } from "./TurnProgress";

type PlayerProps = Pick<ITrucoshiMatchState, "canPlay" | "canSay" | "previousHand" | "match"> &
  PropsWithPlayer<{
    onPlayCard: ITrucoshiMatchActions["playCard"];
    onSayCommand: ITrucoshiMatchActions["sayCommand"];
  }>;

const MatchPlayer = ({
  match,
  previousHand,
  player,
  canSay,
  canPlay,
  onPlayCard,
  onSayCommand,
}: PlayerProps) => {
  const [, isPrevious] = useRounds(match, previousHand);

  const bestEnvido = Math.max(...(player.envido || []));

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
          <Box pt={1} minHeight="4em">
            {!isPrevious && !player.disabled &&
              player.hand.map((card, idx) =>
                canPlay && player.isMe && player.isTurn ? (
                  <GameCard
                    enableHover
                    key={card + player.key}
                    card={card as ICard}
                    onClick={() => onPlayCard(idx, card as ICard)}
                  />
                ) : (
                  <GameCard key={card + player.key} card={card as ICard} />
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
    </Box>
  );
};

MatchPlayer.whyDidYouRender = true;

export { MatchPlayer };
