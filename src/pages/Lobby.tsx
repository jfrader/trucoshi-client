import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { Box, Button, Container } from "@mui/material";
import { GameTable } from "../components/GameTable";
import { PlayerTag } from "../components/PlayerTag";
import { getTeamColor, getTeamName } from "../utils/team";
import { EMatchTableState } from "trucoshi";
import { AnimatedButton } from "../components/AnimatedButton";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { ChatRoom } from "../components/ChatRoom";

export const Lobby = () => {
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const [{ match, me, error }, { joinMatch, setReady, startMatch, isMe }] = useMatch(sessionId);

  useEffect(() => {
    if (match) {
      if (match.state === EMatchTableState.STARTED || match.state === EMatchTableState.FINISHED) {
        setTimeout(() => navigate(`/match/${sessionId}`));
      }
      return;
    }
  }, [match, navigate, session, sessionId]);

  const onJoinMatch = (teamIdx: 0 | 1) => sessionId && joinMatch(sessionId, teamIdx);
  const onStartMatch = () => startMatch();
  const onSetReady = () => sessionId && setReady(sessionId, true);
  const onSetUnReady = () => sessionId && setReady(sessionId, false);

  return (
    <Container>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match && (
        <GameTable
          match={match}
          fill={6}
          FillSlot={({ i }) => {
            const joinTeamIdx = i % 2 === 0 ? 0 : 1;
            return !me || joinTeamIdx !== me.teamIdx ? (
              <Button
                variant="text"
                color={getTeamColor(joinTeamIdx)}
                onClick={() => onJoinMatch(joinTeamIdx)}
              >
                Unirse a {getTeamName(joinTeamIdx)}
              </Button>
            ) : null;
          }}
          Slot={({ player }) => {
            const itsme = isMe(player);
            return (
              <Box pt={4}>
                <Box>
                  <PlayerTag isTurn={itsme} isMe={itsme} player={player} />
                  <Box pt={2}>
                    {isMe(player) ? null : (
                      <Button
                        size="small"
                        color={player.ready && !player.disabled ? "success" : "error"}
                      >
                        {player.ready ? "Listo" : "Esperando"}
                      </Button>
                    )}
                    {isMe(player) ? (
                      me?.ready ? (
                        <Button size="small" color="success" onClick={onSetUnReady}>
                          Listo
                        </Button>
                      ) : (
                        <AnimatedButton size="small" color="warning" onClick={onSetReady}>
                          Estoy Listo
                        </AnimatedButton>
                      )
                    ) : null}
                  </Box>
                </Box>
                <Box>
                  {isMe(player) && player.isOwner ? (
                    <Box>
                      <Box>
                        <Button
                          disabled={match.state !== EMatchTableState.READY}
                          variant="contained"
                          size="small"
                          color="success"
                          onClick={onStartMatch}
                        >
                          Empezar Partida
                        </Button>
                      </Box>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            );
          }}
        />
      )}
      <Box position="fixed" left="2em" top="2em">
        <ChatRoom matchId={sessionId} players={match?.players} />
      </Box>
    </Container>
  );
};
