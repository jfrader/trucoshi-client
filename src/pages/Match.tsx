import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/GameTable";
import { Rounds } from "../components/Rounds";
import { EMatchTableState } from "trucoshi";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { ChatRoom } from "../components/ChatRoom";
import { getTeamColor, getTeamName } from "../utils/team";
import { MatchPlayer } from "../components/MatchPlayer";
import { MatchPoints } from "../components/MatchPoints";
import { useSound } from "../sound/hooks/useSound";

export const Match = () => {
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();

  const [
    { match, error, canSay, canPlay, previousHand, me },
    { playCard, sayCommand, leaveMatch, nextHand },
  ] = useMatch(sessionId, {
    onMyTurn: () => queue("turn"),
    onNewHand: () => queue("round"),
  });

  const navigate = useNavigate();

  useEffect(() => {
    return () => leaveMatch();
  }, [leaveMatch]);

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  if (match && match.winner) {
    const teamIdx = match.winner.players.at(0)?.teamIdx as 0 | 1;
    return (
      <Container>
        <SocketBackdrop />
        <MatchBackdrop error={error} />
        <Typography pt="1em" variant="h4">
          El equipo ganador es
        </Typography>
        <Typography pt="1em" variant="h4" color={getTeamColor(teamIdx)}>
          {getTeamName(teamIdx)}
        </Typography>
        <Box mb={4}>
          {match.winner.players.map((p) => (
            <Typography key={p.key} display="inline" pt="1em" px="2em" variant="h5">
              {p.id}
            </Typography>
          ))}
        </Box>
        <ChatRoom
          mb={4}
          position="relative"
          width="30rem"
          height="30rem"
          matchId={sessionId}
          players={match?.players}
        />
        <Box py={4}>
          <Button component={Link} to="/" variant="text">
            Volver al inicio
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match && (
        <>
          <GameTable
            zoomOnIndex={me ? 0 : -1}
            match={match}
            Slot={({ player }) => (
              <MatchPlayer
                key={player.key}
                previousHand={previousHand}
                canSay={canSay}
                canPlay={canPlay}
                player={player}
                session={session}
                onPlayCard={playCard}
                onSayCommand={sayCommand}
                match={match}
              />
            )}
            InnerSlot={({ player }) => (
              <Rounds
                key={player.key}
                previousHand={previousHand}
                previousHandCallback={nextHand}
                player={player}
                match={match}
              />
            )}
          />

          <Box position="fixed" right={0} top="52px">
            <MatchPoints teams={match.teams} prevHandPoints={previousHand?.points} />
          </Box>
        </>
      )}
      <Box position="fixed" left={0} top="48px">
        <ChatRoom matchId={sessionId} players={match?.players} />
      </Box>
    </Container>
  );
};
