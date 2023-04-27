import { Box, BoxProps, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { IHandPoints, IPublicTeam } from "trucoshi";
import { PREVIOUS_HAND_ANIMATION_DURATION } from "../trucoshi/constants";
import { TeamCard, TeamTag } from "./TeamTag";

export const MatchPoints = ({
  teams,
  prevHandPoints,
  ...boxProps
}: {
  teams: Array<IPublicTeam>;
  prevHandPoints?: IHandPoints | null;
} & BoxProps) => {
  const [points, setPoints] = useState<IHandPoints | void | null>(prevHandPoints);

  useEffect(() => {
    setPoints(prevHandPoints);
    const timeout = setTimeout(() => setPoints(), PREVIOUS_HAND_ANIMATION_DURATION);
    return () => clearTimeout(timeout)
  }, [prevHandPoints]);

  return (
    <Box display="flex" flexDirection="column" {...boxProps}>
      {teams.map((team, i) => (
        <Box key={i} mx={1}>
          <TeamCard>
            <TeamTag teamIdx={i} />
            {team.points.buenas ? (
              <Typography>
                {team.points.buenas} <span>buenas</span>
              </Typography>
            ) : (
              <Typography>
                {team.points.malas} <span>malas</span>
              </Typography>
            )}
            {points && points[i as 0 | 1] !== undefined ? (
              <Typography variant="h6">
                {"+"} {points[i as 0 | 1]}
              </Typography>
            ) : null}
          </TeamCard>
        </Box>
      ))}
    </Box>
  );
};
