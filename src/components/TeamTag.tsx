import { Box, styled, Typography } from "@mui/material";
import { getTeamColor, getTeamName } from "../utils/team";

interface ITeamTagProps {
    teamIdx: number;
}

export const TeamTag = ({ teamIdx }: ITeamTagProps) => {
  return (
    <Typography color={getTeamColor(teamIdx)}>
      <span>{getTeamName(teamIdx)}</span>
    </Typography>
  );
};

export const TeamCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 1, 2),
}));
