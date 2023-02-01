import { Paper, styled, Typography } from "@mui/material";
import { getTeamColor, getTeamName } from "../utils/team";

interface ITeamTagProps {
    teamIdx: number;
}

export const TeamTag = ({ teamIdx }: ITeamTagProps) => {
  return (
    <Typography color={getTeamColor(teamIdx)} variant="subtitle1">
      <span>{getTeamName(teamIdx)}</span>
    </Typography>
  );
};

export const TeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}));
