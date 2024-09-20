import { Box, Button } from "@mui/material";
import { ITrucoshiMatchActions, ITrucoshiMatchState, PropsWithPlayer } from "../../trucoshi/types";
import { COMMANDS_HUMAN_READABLE, DANGEROUS_COMMANDS } from "../../trucoshi/constants";
import { PropsWithChildren } from "react";

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
      sx={(theme) => ({ zIndex: theme.zIndex.fab, transform: "translate(-50%, 0)" })}
    >
      <Box
        display="flex"
        gap={1}
        flexWrap="wrap"
        justifyContent="center"
        sx={(theme) => ({ zIndex: theme.zIndex.fab })}
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
        {player.commands?.map((command) => (
          <Button
            key={command}
            onClick={() => onSayCommand(command)}
            variant="contained"
            color={DANGEROUS_COMMANDS.includes(command) ? "error" : "success"}
          >
            {COMMANDS_HUMAN_READABLE[command]}
          </Button>
        ))}
        {children}
      </Box>
    </Box>
  );
};
