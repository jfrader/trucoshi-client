import { Button, Stack } from "@mui/material";
import { ITrucoshiMatchActions, ITrucoshiMatchState, PropsWithPlayer } from "../../trucoshi/types";
import { COMMANDS_HUMAN_READABLE, DANGEROUS_COMMANDS } from "../../trucoshi/constants";
import { PropsWithChildren } from "react";

export const CommandBar = ({
  children,
  player,
  canSay,
  isPrevious,
  onSayCommand,
}: PropsWithChildren<
  PropsWithPlayer<
    Pick<ITrucoshiMatchState, "canSay"> & {
      onSayCommand: ITrucoshiMatchActions["sayCommand"];
      isPrevious: boolean;
    }
  >
>) => {
  const bestEnvido = Math.max(...(player.envido || []));

  if (player.abandoned || !canSay || isPrevious) {
    return null;
  }

  return (
    <Stack
      position="absolute"
      bottom="1.2rem"
      left="50%"
      sx={{ transform: "translate(-50%, 0)" }}
      direction="row"
      width="95vw"
      gap={1}
      flexWrap="wrap"
      justifyContent="center"
    >
      {player.isEnvidoTurn &&
        Array.from(new Set(player.envido))
          ?.sort((a, b) => a - b)
          .map((points) => (
            <Button
              key={points}
              onClick={() => onSayCommand(points)}
              variant="contained"
              color={bestEnvido === points ? "success" : "error"}
            >
              {points}
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
    </Stack>
  );
};
