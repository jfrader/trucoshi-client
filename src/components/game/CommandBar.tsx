import { Box, Button } from "@mui/material";
import { ITrucoshiMatchActions, PropsWithPlayer } from "../../trucoshi/types";
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
  compact = false,
}: PropsWithChildren<
  PropsWithPlayer<
    {
      canSay: boolean;
      onSayCommand: ITrucoshiMatchActions["sayCommand"];
      compact?: boolean;
    }
  >
>) => {
  const bestEnvido = Math.max(...(player.envido?.map((e) => e.value) || []));

  if (player.abandoned || !canSay) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        zIndex: theme.zIndex.fab,
        background: "linear-gradient(160deg, rgba(39, 24, 16, 0.95), rgba(20, 14, 10, 0.96))",
        borderRadius: "1rem",
        border: "1px solid rgba(255,255,255,0.14)",
        p: 1,
        boxShadow: "0 10px 24px rgba(0,0,0,0.38)",
      })}
    >
      <Box
        display="flex"
        gap={0.55}
        flexWrap="wrap"
        justifyContent="center"
        alignContent="flex-start"
        minHeight={compact ? "4.5rem" : "5.7rem"}
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
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: compact ? "0.8rem" : "0.88rem",
                    px: compact ? 1 : 1.25,
                    py: compact ? 0.5 : 0.65,
                  }}
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
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: compact ? "0.8rem" : "0.88rem",
                    px: compact ? 1 : 1.25,
                    py: compact ? 0.5 : 0.65,
                  }}
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
