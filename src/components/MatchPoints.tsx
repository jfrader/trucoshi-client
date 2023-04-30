import { Box, BoxProps, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { IHandPoints, IPublicMatch } from "trucoshi";
import { TeamCard, TeamTag } from "./TeamTag";

export const MatchPoints = ({
  match,
  prevHandPoints,
  ...boxProps
}: {
  match: IPublicMatch;
  prevHandPoints?: IHandPoints | null;
} & BoxProps) => {
  const [points, setPoints] = useState<IHandPoints | void | null>(prevHandPoints);

  useEffect(() => {
    setPoints(prevHandPoints);
    const timeout = setTimeout(() => setPoints(), match.options.handAckTime);
    return () => clearTimeout(timeout);
  }, [match.options.handAckTime, prevHandPoints]);

  return (
    <Box display="flex" flexDirection="column" {...boxProps}>
      {match.teams.map((team, i) => (
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
