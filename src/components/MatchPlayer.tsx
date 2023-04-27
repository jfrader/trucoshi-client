import { Box, Button, ButtonGroup, LinearProgress, Typography } from "@mui/material";
import { ICard, IPublicPlayer, PLAYER_ABANDON_TIMEOUT, PLAYER_TURN_TIMEOUT } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, ITrucoshiMatchState } from "../trucoshi/types";
import { GameCard } from "./GameCard";
import { PlayerTag } from "./PlayerTag";
import { DANGEROUS_COMMANDS, COMMANDS_HUMAN_READABLE } from "../trucoshi/constants";
import { useEffect, useMemo, useState } from "react";

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
  const [, isPrevious] = useRounds(match, previousHand);

  const bestEnvido = Math.max(...(player.envido || []));

  const [turnTimer, setTurnTimer] = useState<{ isExtension: boolean; progress: number }>({
    isExtension: false,
    progress: 0,
  });

  useEffect(() => {
    if (!player.isTurn) {
      return;
    }
    const interval = setInterval(() => {
      setTurnTimer(({ isExtension }) => {
        const now = Math.floor(Date.now());
        if (!player.turnExpiresAt || !player.turnExtensionExpiresAt) {
          return { isExtension: false, progress: 0 };
        }
        if (isExtension) {
          const difference = player.turnExtensionExpiresAt - now;
          const progress = Math.floor((difference * 100) / PLAYER_ABANDON_TIMEOUT);
          return { isExtension, progress };
        }
        const difference = player.turnExpiresAt - now;
        if (difference > 0) {
          const progress = Math.floor((difference * 100) / PLAYER_TURN_TIMEOUT);
          return {
            isExtension: false,
            progress,
          };
        }
        return { isExtension: true, progress: 100 };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [player.isTurn, player.turnExpiresAt, player.turnExtensionExpiresAt]);

  return useMemo(
    () => (
      <Box flexGrow={1} display="flex" flexDirection="column">
        <Box
          maxWidth="100%"
          pt={1}
          display="flex"
          flexDirection="column"
          flexGrow={1}
          height="100%"
        >
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
                player.hand
                  .map((c, i) => [c, i + c + player.key])
                  .map(([card, key], idx) =>
                    canPlay && player.isMe && player.isTurn ? (
                      <GameCard
                        enableHover
                        key={key}
                        card={card as ICard}
                        onClick={() => onPlayCard(idx, card as ICard)}
                      />
                    ) : (
                      <GameCard key={key} card={card as ICard} />
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
              <ButtonGroup
                sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}
              >
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
    ),
    [
      bestEnvido,
      canPlay,
      canSay,
      isPrevious,
      onPlayCard,
      onSayCommand,
      player,
      previousHand,
      turnTimer.isExtension,
      turnTimer.progress,
    ]
  );
};
