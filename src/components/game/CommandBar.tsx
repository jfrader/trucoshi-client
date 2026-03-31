import { Box, Button, Typography, useTheme } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { ITrucoshiMatchActions } from "../../trucoshi/types";
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
import { IPublicPlayer } from "trucoshi";

const getActionColorByCommand = (theme: Theme): Partial<Record<ECommand, string>> => ({
  [ETrucoCommand.TRUCO]: theme.trucoshiUi.commandBar.actionColors.truco,
  [ETrucoCommand.RE_TRUCO]: theme.trucoshiUi.commandBar.actionColors.reTruco,
  [ETrucoCommand.VALE_CUATRO]: theme.trucoshiUi.commandBar.actionColors.valeCuatro,
  [EEnvidoCommand.ENVIDO]: theme.trucoshiUi.commandBar.actionColors.envido,
  [EEnvidoCommand.REAL_ENVIDO]: theme.trucoshiUi.commandBar.actionColors.realEnvido,
  [EEnvidoCommand.FALTA_ENVIDO]: theme.trucoshiUi.commandBar.actionColors.faltaEnvido,
  [EFlorCommand.FLOR]: theme.trucoshiUi.commandBar.actionColors.flor,
  [EFlorCommand.CONTRAFLOR]: theme.trucoshiUi.commandBar.actionColors.contraflor,
  [EFlorCommand.CONTRAFLOR_AL_RESTO]: theme.trucoshiUi.commandBar.actionColors.contraflorAlResto,
  [EAnswerCommand.QUIERO]: theme.trucoshiUi.commandBar.actionColors.quiero,
  [EAnswerCommand.NO_QUIERO]: theme.trucoshiUi.commandBar.actionColors.noQuiero,
  [EEnvidoAnswerCommand.SON_BUENAS]: theme.trucoshiUi.commandBar.actionColors.sonBuenas,
  [EFlorCommand.ACHICO]: theme.trucoshiUi.commandBar.actionColors.achico,
  [ESayCommand.PASO]: theme.trucoshiUi.commandBar.actionColors.paso,
  [ESayCommand.MAZO]: theme.trucoshiUi.commandBar.actionColors.mazo,
});

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

type CommandBarProps = PropsWithChildren<{
  player?: IPublicPlayer | null;
  canSay: boolean;
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
  compact?: boolean;
  showActions?: boolean;
  statusLabel?: string;
}>;

export const CommandBar = ({
  children,
  player,
  canSay,
  onSayCommand,
  compact = false,
  showActions = true,
  statusLabel = "Esperando jugada",
}: CommandBarProps) => {
  const theme = useTheme();
  const actionColorByCommand = getActionColorByCommand(theme);
  const bestEnvido = Math.max(...(player?.envido?.map((e) => e.value) || []));
  const shouldRenderActions = Boolean(showActions && canSay && player && !player.abandoned);
  const actionablePlayer = shouldRenderActions && player ? player : null;

  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        zIndex: theme.zIndex.fab + 1,
        background: theme.trucoshiUi.commandBar.background,
        borderRadius: "0.95rem",
        border: "1px solid rgba(255,255,255,0.16)",
        p: compact ? 0.75 : 0.95,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 10px 24px rgba(0,0,0,0.42)",
      })}
    >
      <Box
        sx={{
          width: "100%",
          overflowX: shouldRenderActions ? "auto" : "hidden",
          overflowY: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {actionablePlayer ? (
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
            {actionablePlayer.isEnvidoTurn &&
              actionablePlayer.envido
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
                      bgcolor:
                        bestEnvido === points.value
                          ? theme.trucoshiUi.commandBar.envidoBestColor
                          : theme.trucoshiUi.commandBar.envidoBaseColor,
                    }}
                  >
                    {points.value}
                  </Button>
                ))}
            {actionablePlayer.commands
              ? [...actionablePlayer.commands]
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
                        bgcolor:
                          actionColorByCommand[command] || theme.trucoshiUi.commandBar.defaultActionColor,
                      }}
                    >
                      {COMMANDS_HUMAN_READABLE[command] || command}
                    </Button>
                  ))
              : null}
            {children}
          </Box>
        ) : (
          <Typography fontSize="0.84rem" color="grey.300" fontWeight={600} textAlign="center">
            {statusLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
