import { Box, Button, Typography, useTheme } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { ITrucoshiMatchActions } from "../../trucoshi/types";
import {
  COMMANDS_HUMAN_READABLE,
  DANGEROUS_COMMANDS,
  WARNING_COMMANDS,
} from "../../trucoshi/constants";
import { memo, PropsWithChildren, useMemo } from "react";
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
  color: "common.white",
};

type CommandBarProps = PropsWithChildren<{
  player?: IPublicPlayer | null;
  canSay: boolean;
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
  compact?: boolean;
  showActions?: boolean;
  statusLabel?: string;
  embedded?: boolean;
}>;

const _CommandBar = ({
  children,
  player,
  canSay,
  onSayCommand,
  compact = false,
  showActions = true,
  statusLabel = "Esperando oponente",
  embedded = false,
}: CommandBarProps) => {
  const theme = useTheme();
  const actionColorByCommand = useMemo(() => getActionColorByCommand(theme), [theme]);
  const sortedEnvido = useMemo(
    () => [...(player?.envido || [])].sort((a, b) => a.value - b.value),
    [player?.envido]
  );
  const sortedCommands = useMemo(
    () =>
      [...(player?.commands || [])]
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
        }),
    [player?.commands]
  );
  const bestEnvido = Math.max(...sortedEnvido.map((e) => e.value));
  const shouldRenderActions = Boolean(showActions && canSay && player && !player.abandoned);
  const actionablePlayer = shouldRenderActions && player ? player : null;

  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        zIndex: theme.zIndex.fab + 1,
        background: embedded ? "transparent" : theme.trucoshiUi.commandBar.background,
        borderRadius: embedded ? "0.6rem" : "0.95rem",
        border: embedded ? "none" : theme.trucoshiUi.commandBar.panelBorder,
        p: embedded ? 0.22 : compact ? 0.75 : 0.95,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        boxShadow: embedded ? "none" : theme.trucoshiUi.commandBar.panelShadow,
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
            minHeight={embedded ? "100%" : "3.35rem"}
            minWidth="100%"
            width="max-content"
          >
            {actionablePlayer.isEnvidoTurn &&
              sortedEnvido.map((points) => (
                  <Button
                    key={points.value}
                    onClick={() => onSayCommand(points.value)}
                    variant="contained"
                    sx={{
                      ...baseActionButtonSx,
                      border: theme.trucoshiUi.commandBar.actionBorder,
                      boxShadow: theme.trucoshiUi.commandBar.actionShadow,
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
              ? sortedCommands.map(([, command]) => (
                    <Button
                      key={command}
                      onClick={() => onSayCommand(command)}
                      variant="contained"
                      sx={{
                        ...baseActionButtonSx,
                        border: theme.trucoshiUi.commandBar.actionBorder,
                        boxShadow: theme.trucoshiUi.commandBar.actionShadow,
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

export const CommandBar = memo(_CommandBar);
