import { Box, Button } from "@mui/material";
import { ITrucoshiMatchActions, ITrucoshiMatchState, PropsWithPlayer } from "../../trucoshi/types";
import {
  COMMANDS_HUMAN_READABLE,
  DANGEROUS_COMMANDS,
  WARNING_COMMANDS,
} from "../../trucoshi/constants";
import { PropsWithChildren } from "react";
import { ECommand } from "trucoshi";

export const CommandBar = ({
  children,
  player,
  canSay,
  onSayCommand,
}: PropsWithChildren<
  PropsWithPlayer<
    Pick<ITrucoshiMatchState, "canSay"> & {
      onSayCommand: ITrucoshiMatchActions["sayCommand"];
    }
  >
>) => {
  const bestEnvido = Math.max(...(player.envido?.map((e) => e.value) || []));

  if (player.abandoned || !canSay) {
    return null;
  }

  return (
    <Box
      position="absolute"
      bottom="1.2rem"
      left="50%"
      width="90vw"
      sx={(theme) => ({ zIndex: theme.zIndex.fab, transform: "translate(-50%, 0)", pointerEvents: "none" })}
    >
      <Box
        display="flex"
        gap={1}
        margin="0 auto"
        flexWrap="wrap"
        justifyContent="center"
        width="fit-content"
        sx={(theme) => ({ zIndex: theme.zIndex.fab, pointerEvents: "initial" })}
      >
        {player.isEnvidoTurn &&
          player.envido
            ?.sort((a, b) => a.value - b.value)
            .map((points) => (
              <Button
                key={points.value}
                onClick={() => onSayCommand(points.value)}
                variant="contained"
                color={bestEnvido === points.value ? "success" : "error"}
              >
                {points.value}
              </Button>
            ))}
        {player.commands
          ? [...player.commands]
              .map((c): [number, ECommand] => {
                if (DANGEROUS_COMMANDS.includes(c)) {
                  return [2, c];
                }

                if (WARNING_COMMANDS.includes(c)) {
                  return [1, c];
                }

                return [0, c];
              })
              .sort(([a], [b]) => {
                return a - b;
              })
              .map(([, command]) => (
                <Button
                  key={command}
                  onClick={() => onSayCommand(command)}
                  variant="contained"
                  color={
                    DANGEROUS_COMMANDS.includes(command)
                      ? "error"
                      : WARNING_COMMANDS.includes(command)
                      ? "warning"
                      : "success"
                  }
                >
                  {COMMANDS_HUMAN_READABLE[command] || command}
                </Button>
              ))
          : null}
        {children}
      </Box>
    </Box>
  );
};
