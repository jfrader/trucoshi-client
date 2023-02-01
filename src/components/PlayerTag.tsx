import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { TeamTag } from "./TeamTag";

interface ITeamTagProps {
  player: IPublicPlayer;
}

export const PlayerTag = ({ player }: ITeamTagProps) => {
  return (
    <Box>
      <Typography display="inline" variant="h5">
        {player.id}
      </Typography>
      <TeamTag player={player} />
    </Box>
  );
};
