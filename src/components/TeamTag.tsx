import { Typography } from "@mui/material";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { getTeamColor, getTeamName } from "../utils/team";

interface ITeamTagProps {
  player: IPublicPlayer;
}

export const TeamTag = ({ player }: ITeamTagProps) => {
  return (
    <Typography color={getTeamColor(player.teamIdx)} variant="subtitle1">
      <span>{getTeamName(player.teamIdx)}</span>
    </Typography>
  );
};
