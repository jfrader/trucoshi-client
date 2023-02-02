import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { Table } from "./Table";
import { GameCard } from "./GameCard";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { PlayerTag } from "./PlayerTag";
import { TeamCard, TeamTag } from "./TeamTag";
import { Rounds } from "./Rounds";
import { EMatchTableState, ICard, IHandPoints, IPublicMatch, IPublicPlayer, IPublicTeam } from "trucoshi";
import { PREVIOUS_HAND_ANIMATION_DURATION } from "../trucoshi/constants";

const Player = ({
  match,
  session,
  onPlayCard,
  player,
}: {
  match: IPublicMatch;
  session: string | null;
  onPlayCard: (cardIdx: number, card: ICard) => void;
  player: IPublicPlayer;
}) => {
  const isMe = player.session === session;
  const [, isPrevious] = useRounds(match);
  return (
    <Box maxWidth="100%" pt={2}>
      <PlayerTag player={player} isTurn={player.isTurn} />
      <Box zIndex={10} pt={2}>
        {!isPrevious &&
          player.hand
            .map((c, idx) => [c, idx + c + player.session])
            .map(([card, key], idx) =>
              isMe && player.isTurn ? (
                <GameCard
                  key={key}
                  card={card as ICard}
                  color="primary"
                  onClick={() => onPlayCard(idx, card as ICard)}
                />
              ) : (
                <GameCard
                  key={key}
                  card={isMe ? <span>{card}</span> : <span>&nbsp;&nbsp;</span>}
                  color={isMe ? "primary" : "error"}
                />
              )
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
    setTimeout(() => setPoints(), PREVIOUS_HAND_ANIMATION_DURATION);
  }, [prevHandPoints]);

  return (
    <Box display="flex">
      {teams.map((team, i) => (
        <Box mx={1}>
          {team.points.buenas ? (
            <TeamCard>
              <TeamTag teamIdx={i} />
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
              <TeamTag teamIdx={i} />
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
  const [{ match, me }, { playCard }] = useMatch(sessionId);

  const navigate = useNavigate();

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  const props = { session, isMyTurn: me?.isTurn, onPlayCard: playCard, match };

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
