import { styled, Typography, TypographyProps } from "@mui/material";
import { Box, css } from "@mui/system";
import { IPublicPlayer } from "trucoshi";
import { bounce } from "../animations/bounce";
import { TeamTag } from "./TeamTag";

interface ITeamTagProps {
  player: IPublicPlayer;
  isTurn?: boolean;
  isMe?: boolean;
}

export const PlayerTag = ({ player, isTurn, isMe, ...props }: ITeamTagProps & TypographyProps) => {
  return (
    <AnimatedBox isturn={Number(isTurn && isMe)}>
      <PlayerName isturn={Number(isTurn)} display="inline" variant="h5" {...props}>
        {player.id}
      </PlayerName>
      <TeamTag teamIdx={player.teamIdx} />
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
