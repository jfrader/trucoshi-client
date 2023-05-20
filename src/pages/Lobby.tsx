import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { Box, Button } from "@mui/material";
import { GameTable } from "../components/GameTable";
import { PlayerTag } from "../components/PlayerTag";
import { getTeamColor, getTeamName } from "../utils/team";
import { EMatchState } from "trucoshi";
import { AnimatedButton } from "../shared/AnimatedButton";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { ChatRoom, useChatRoom } from "../components/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { FloatingProgress } from "../shared/FloatingProgress";

export const Lobby = () => {
  useSound();
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const [{ match, me, error }, { joinMatch, setReady, startMatch }] = useMatch(sessionId);

  useEffect(() => {
    if (match) {
      if (match.state === EMatchState.STARTED || match.state === EMatchState.FINISHED) {
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
    <Box>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match ? (
        <GameTable
          match={match}
          fill={6}
          FillSlot={({ i }) => {
            const joinTeamIdx = i % 2 === 0 ? 0 : 1;
            return !me || joinTeamIdx !== me.teamIdx ? (
              <Box height="6em" display="flex" alignItems="end" justifyContent="center">
                <Button
                  variant="text"
                  color={getTeamColor(joinTeamIdx)}
                  onClick={() => onJoinMatch(joinTeamIdx)}
                >
                  Unirse a {getTeamName(joinTeamIdx)}
                </Button>
              </Box>
            ) : null;
          }}
          Slot={({ player }) => {
            return (
              <Box pt={4}>
                <Box>
                  <PlayerTag isTurn={player.isMe} player={player} />
                  <Box pt={2}>
                    {player.isMe ? null : (
                      <Button
                        size="small"
                        color={player.ready && !player.disabled ? "success" : "error"}
                      >
                        {player.ready ? "Listo" : "Esperando"}
                      </Button>
                    )}
                    {player.isMe ? (
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
                  {player.isMe && player.isOwner ? (
                    <Box>
                      <Box>
                        <Button
                          disabled={match.state !== EMatchState.READY}
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
      ) : (
        <FloatingProgress />
      )}
      <Box position="fixed" left={0} top="48px">
        <ChatRoom {...useChatRoom(match)} />
      </Box>
    </Box>
  );
};
