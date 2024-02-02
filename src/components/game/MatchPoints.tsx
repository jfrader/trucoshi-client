import { Box, BoxProps, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { IHandPoints, IPublicMatch } from "trucoshi";
import { TeamCard, TeamTag } from "./TeamTag";
import { ChatButton } from "../chat/ChatRoom";
import { getTeamColor } from "../../utils/team";

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
    <Container display="flex" flexDirection="row" {...boxProps}>
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
            <Typography variant="h6">
              {points && points[i as 0 | 1] !== undefined ? (
                <ChatButton color={getTeamColor(i as 0 | 1)}>
                  <Typography fontSize="large">
                    {"+"} {points[i as 0 | 1]}
                  </Typography>
                </ChatButton>
              ) : (
                <span>&nbsp;</span>
              )}
            </Typography>
          </TeamCard>
        </Box>
      ))}
    </Container>
  );
};

const Container = styled(Box)(({ theme }) => ({
  flexDirection: "column",
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
  },
}));
