import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/GameTable";
import { Rounds } from "../components/Rounds";
import { EMatchTableState } from "trucoshi";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { ChatRoom, useChatRoom } from "../components/ChatRoom";
import { getTeamColor, getTeamName } from "../utils/team";
import { MatchPlayer } from "../components/MatchPlayer";
import { MatchPoints } from "../components/MatchPoints";
import { useSound } from "../sound/hooks/useSound";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { FloatingProgress } from "../components/FloatingProgress";
import { TrucoshiLogo } from "../components/TrucoshiLogo";

export const Match = () => {
  useTrucoshi();

  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();

  const [
    { match, error, canSay, canPlay, previousHand, me },
    { playCard, sayCommand, leaveMatch, nextHand },
  ] = useMatch(sessionId, {
    onMyTurn: () => queue("turn"),
    onNewHand: () => queue("round"),
  });

  const chatProps = useChatRoom(match);

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
      <Container maxWidth="sm">
        <SocketBackdrop />
        <MatchBackdrop error={error} />

        <Box>
          <Typography pt="1em" variant="h4">
            Partida Finalizada
          </Typography>
          <Button component={Link} to="/" variant="text">
            Volver al inicio
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box flexGrow={1} textAlign="left">
            <Typography pt="1em" variant="h5">
              Equipo ganador
            </Typography>
            <Typography variant="h4" color={getTeamColor(teamIdx)}>
              {getTeamName(teamIdx)}
            </Typography>
            <Box mb={4}>
              {match.winner.players.map((p) => (
                <Typography key={p.key} display="inline" pt="1em" pr="1.6em" variant="h6">
                  {p.id}
                </Typography>
              ))}
            </Box>
          </Box>
          <TrucoshiLogo width="80em" />
          <MatchPoints match={match} prevHandPoints={previousHand?.points} />
        </Box>
        <ChatRoom
          alwaysVisible
          mb={4}
          position="relative"
          width="100%"
          height="30rem"
          {...chatProps}
        />
      </Container>
    );
  }

  return (
    <Box>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match ? (
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
            <MatchPoints match={match} prevHandPoints={previousHand?.points} />
          </Box>
        </>
      ) : (
        <FloatingProgress />
      )}
      <Box position="fixed" left={0} top="48px">
        <ChatRoom {...chatProps} />
      </Box>
    </Box>
  );
};
