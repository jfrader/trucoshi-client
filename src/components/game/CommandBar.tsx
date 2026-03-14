import { Box, Button } from "@mui/material";
import { ITrucoshiMatchActions, PropsWithPlayer } from "../../trucoshi/types";
import {
  COMMANDS_HUMAN_READABLE,
  DANGEROUS_COMMANDS,
  WARNING_COMMANDS,
} from "../../trucoshi/constants";
import { PropsWithChildren } from "react";
import {
  EAnswerCommand,
  ECommand,
  EEnvidoAnswerCommand,
  EEnvidoCommand,
  EFlorCommand,
  ESayCommand,
  ETrucoCommand,
} from "trucoshi";

const actionColorByCommand: Partial<Record<ECommand, string>> = {
  [ETrucoCommand.TRUCO]: "#ab3a2a",
  [ETrucoCommand.RE_TRUCO]: "#b43a29",
  [ETrucoCommand.VALE_CUATRO]: "#c03d2b",
  [EEnvidoCommand.ENVIDO]: "#3d546a",
  [EEnvidoCommand.REAL_ENVIDO]: "#7a6640",
  [EEnvidoCommand.FALTA_ENVIDO]: "#6c5b36",
  [EFlorCommand.FLOR]: "#4b6938",
  [EFlorCommand.CONTRAFLOR]: "#4e6a39",
  [EFlorCommand.CONTRAFLOR_AL_RESTO]: "#4e6a39",
  [EAnswerCommand.QUIERO]: "#3d7a45",
  [EAnswerCommand.NO_QUIERO]: "#4a3224",
  [EEnvidoAnswerCommand.SON_BUENAS]: "#5c3e2c",
  [EFlorCommand.ACHICO]: "#5b3b2a",
  [ESayCommand.PASO]: "#435260",
  [ESayCommand.MAZO]: "#5f2e24",
};

const baseActionButtonSx = {
  whiteSpace: "nowrap",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  borderRadius: "0.66rem",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 3px 10px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
  color: "common.white",
};

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
        background:
          "linear-gradient(164deg, rgba(63, 36, 22, 0.97) 0%, rgba(32, 20, 12, 0.98) 70%, rgba(25, 16, 11, 0.98) 100%)",
        borderRadius: "0.95rem",
        border: "1px solid rgba(255,255,255,0.16)",
        p: compact ? 0.75 : 0.95,
        boxShadow: "0 10px 24px rgba(0,0,0,0.42)",
      })}
    >
      <Box
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Box
          display="flex"
          gap={0.5}
          flexWrap="nowrap"
          justifyContent="center"
          alignContent="flex-start"
          minHeight="3.35rem"
          minWidth="100%"
          width="max-content"
        >
          {player.isEnvidoTurn &&
            player.envido
              ?.sort((a, b) => a.value - b.value)
              .map((points) => (
                <Button
                  key={points.value}
                  onClick={() => onSayCommand(points.value)}
                  variant="contained"
                  sx={{
                    ...baseActionButtonSx,
                    fontSize: compact ? "0.76rem" : "0.85rem",
                    px: compact ? 0.9 : 1.2,
                    py: compact ? 0.48 : 0.62,
                    flexShrink: 0,
                    minWidth: compact ? "3.1rem" : "3.35rem",
                    bgcolor: bestEnvido === points.value ? "#3d7a45" : "#7a3229",
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
                    sx={{
                      ...baseActionButtonSx,
                      fontSize: compact ? "0.76rem" : "0.85rem",
                      px: compact ? 0.9 : 1.2,
                      py: compact ? 0.48 : 0.62,
                      flexShrink: 0,
                      bgcolor: actionColorByCommand[command] || "#3d7051",
                    }}
                  >
                    {COMMANDS_HUMAN_READABLE[command] || command}
                  </Button>
                ))
            : null}
          {children}
        </Box>
      </Box>
    </Box>
  );
};
