import { Box, styled, Typography } from "@mui/material";
import { getTeamColor, getTeamName } from "../../utils/team";

interface ITeamTagProps {
  teamIdx: number;
  label?: string;
}

export const TeamTag = ({ teamIdx, label }: ITeamTagProps) => {
  return (
    <Typography color={getTeamColor(teamIdx)}>
      <span>{label || getTeamName(teamIdx)}</span>
    </Typography>
  );
};

export const TeamCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 1, 2),
}));
