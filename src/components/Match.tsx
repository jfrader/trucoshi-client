import { Box, Container, Paper, styled, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EMatchTableState, IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshi } from "../hooks/useTrucoshi";
import { useMatch } from "../hooks/useMatch";
import { Table } from "./Table";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { IHandPoints, ICard } from "trucoshi/dist/lib/types";
import { GameCard } from "./GameCard";
import { useRounds } from "../hooks/useRounds";
import { getTeamColor, getTeamName } from "../utils/team";
import { IPublicTeam } from "trucoshi/dist/lib/classes/Team";

const TeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const TeamName = styled(Typography)<{ teamIdx: number }>(({ theme, teamIdx }) => ({
  color: theme.palette[getTeamColor(teamIdx)].main,
}));

const Player = ({
  match,
  session,
  isMyTurn,
  onPlayCard,
  player,
}: {
  match: IPublicMatch;
  session: string | null;
  isMyTurn: boolean;
  onPlayCard: (cardIdx: number, card: ICard) => void;
  player: IPublicPlayer;
}) => {
  const isMe = player.session === session;
  const [, isPrevious] = useRounds(match);
  return (
    <Box maxWidth="100%" pt={2}>
      <Typography variant="h5" color={isMe && isMyTurn ? "green" : undefined}>
        {player.id}
      </Typography>
      <Box zIndex={10} pt={2}>
        {!isPrevious &&
          player.hand
            .map((c, idx) => [c, idx + c + player.session])
            .map(([card, key], idx) =>
              isMe && isMyTurn ? (
                <GameCard
                  key={key}
                  card={card as ICard}
                  variant="contained"
                  color="primary"
                  onClick={() => onPlayCard(idx, card as ICard)}
                />
              ) : (
                <GameCard
                  key={key}
                  card={isMe ? <span>{card}</span> : <span>&nbsp;&nbsp;</span>}
                  variant="contained"
                  color={isMe ? "primary" : "error"}
                />
              )
            )}
      </Box>
    </Box>
  );
};

const Rounds = ({ match, player }: { match: IPublicMatch; player: IPublicPlayer }) => {
  const [rounds] = useRounds(match);

  return (
    <Box maxWidth="100%" marginTop="74px" pr={8}>
      <Box margin="0 auto" position="relative">
        {rounds.map((round, i) =>
          round.map((pc) => {
            if (player.usedHand.includes(pc.card) || player.prevHand.includes(pc.card)) {
              return (
                <Box position="absolute" left="50%" right="50%">
                  <GameCard {...pc} i={i} variant="contained" color="primary" />
                </Box>
              );
            }
            return <span key={pc.key} />;
          })
        )}
      </Box>
    </Box>
  );
};

const MatchPoints = ({
  teams,
  prevHandPoints,
}: {
  teams: Array<IPublicTeam>;
  prevHandPoints?: IHandPoints | null;
}) => {
  const [points, setPoints] = useState<IHandPoints | void | null>(prevHandPoints);

  useEffect(() => {
    setPoints(prevHandPoints);
    setTimeout(() => setPoints(), 4500);
  }, [prevHandPoints]);

  return (
    <Box display="flex">
      {teams.map((team, i) => (
        <Box mx={1}>
          {team.points.buenas ? (
            <TeamCard>
              <TeamName teamIdx={i}>{getTeamName(i)}</TeamName>
              <Typography>
                {team.points.buenas} <span>buenas</span>
              </Typography>
              {points && points[i as 0 | 1] !== undefined ? (
                <Typography variant="h6">
                  {"+"} {points[i as 0 | 1]}
                </Typography>
              ) : null}
            </TeamCard>
          ) : (
            <TeamCard>
              <TeamName teamIdx={i}>{getTeamName(i)}</TeamName>
              <Typography>
                {team.points.malas} <span>malas</span>
              </Typography>
              {points && points[i as 0 | 1] !== undefined ? (
                <Typography variant="h6">
                  {"+"} {points[i as 0 | 1]}
                </Typography>
              ) : null}
            </TeamCard>
          )}
        </Box>
      ))}
    </Box>
  );
};

export const Match = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [{ session }] = useTrucoshi();
  const [{ match, isMyTurn }, { playCard }] = useMatch(sessionId);

  const navigate = useNavigate();

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  const props = { session, isMyTurn, onPlayCard: playCard, match };

  return (
    <Container>
      <Box position="fixed" right="2em" top="4em">
        <MatchPoints teams={match.teams} prevHandPoints={match.prevHandPoints} />
      </Box>
      <Table
        match={match}
        Component={({ player }) => <Player player={player} {...props} />}
        InnerComponent={({ player }) => <Rounds player={player} match={match} />}
      />
    </Container>
  );
};
