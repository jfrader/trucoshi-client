import { styled, Typography, TypographyProps } from "@mui/material";
import { Box, css } from "@mui/system";
import { IPublicPlayer } from "trucoshi";
import { bounce } from "../animations/bounce";
import { TeamTag } from "./TeamTag";

interface ITeamTagProps {
  player: IPublicPlayer;
  isTurn?: boolean;
  disabled?: boolean;
}

export const PlayerTag = ({
  player,
  isTurn,
  disabled,
  ...props
}: ITeamTagProps & TypographyProps) => {
  return (
    <AnimatedBox isturn={Number(!disabled && isTurn && player.isMe)}>
      <PlayerName
        color={disabled ? "text.disabled" : undefined}
        isturn={Number(isTurn)}
        display="inline"
        variant="h5"
        {...props}
      >
        {player.id}
      </PlayerName>
      <Box>
        <TeamTag teamIdx={player.teamIdx} />
      </Box>
    </AnimatedBox>
  );
};

export const PlayerName = styled(Typography)<{ isturn: number }>(({ theme, isturn }) =>
  isturn
    ? {
        color: theme.palette.success.main,
      }
    : {}
);

export const AnimatedBox = styled(Box)<{ isturn: number }>(({ isturn }) =>
  isturn
    ? css`
        animation: ${bounce} 0.8s ease 2;
      `
    : {}
);
