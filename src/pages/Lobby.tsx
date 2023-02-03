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
import { useMatchBackdrop } from "../hooks/useMatchBackdrop";
import { SocketBackdrop } from "../components/SocketBackdrop";

export const Lobby = () => {
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const [onMatchLoad, MatchBackdrop] = useMatchBackdrop();

  const [{ match, me }, { joinMatch, setReady, startMatch, isMe }] = useMatch(
    sessionId,
    onMatchLoad
  );

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
      <MatchBackdrop />
      {match && (
        <GameTable
          match={match}
          fill={6}
          FillSlot={({ i }) => {
            const joinTeamIdx = i % 2 === 0 ? 0 : 1;
            return !me || joinTeamIdx !== me.teamIdx ? (
              <Button
                variant="outlined"
                color={getTeamColor(joinTeamIdx)}
                onClick={() => onJoinMatch(joinTeamIdx)}
              >
                Unirse a {getTeamName(joinTeamIdx)}
              </Button>
            ) : null;
          }}
          Slot={({ player }) => {
            return (
              <Box pt={4}>
                <Box>
                  <PlayerTag isTurn={isMe(player)} player={player} />
                  {isMe(player) ? null : (
                    <Button color={player.ready ? "success" : "error"}>
                      {player.ready ? "Listo" : "Esperando"}
                    </Button>
                  )}
                  {isMe(player) ? (
                    me?.ready ? (
                      <Button color="success" onClick={onSetUnReady}>
                        Listo
                      </Button>
                    ) : (
                      <AnimatedButton color="warning" onClick={onSetReady}>
                        Estoy Listo
                      </AnimatedButton>
                    )
                  ) : null}
                </Box>
                <Box>
                  {isMe(player) && player.isOwner ? (
                    <Box>
                      <Box>
                        <Button
                          disabled={match.state !== EMatchTableState.READY}
                          variant="contained"
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
    </Container>
  );
};
