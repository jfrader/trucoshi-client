import { styled, Typography, TypographyProps } from "@mui/material";
import { Box } from "@mui/system";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { TeamTag } from "./TeamTag";

interface ITeamTagProps {
  player: IPublicPlayer;
  isTurn?: boolean;
}

export const PlayerTag = ({ player, isTurn, ...props }: ITeamTagProps & TypographyProps) => {
  return (
    <Box>
      <PlayerName isTurn={isTurn} display="inline" variant="h5" {...props}>
        {player.id}
      </PlayerName>
      <TeamTag teamIdx={player.teamIdx} />
    </Box>
  );
};

export const PlayerName = styled(Typography)<{ isTurn?: boolean }>(({ theme, isTurn }) =>
  isTurn
    ? {
        color: theme.palette.success.main,
      }
    : {}
);
