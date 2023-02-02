import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { Box, Button, Container } from "@mui/material";
import { Table } from "./Table";
import { PlayerTag } from "./PlayerTag";
import { getTeamColor, getTeamName } from "../utils/team";
import { EMatchTableState } from "trucoshi";

export const Lobby = () => {
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const [{ match, me }, { joinMatch, setReady, startMatch, isMe }] = useMatch(sessionId);

  useEffect(() => {
    if (match) {
      if (match.state === EMatchTableState.STARTED || match.state === EMatchTableState.FINISHED) {
        setTimeout(() => navigate(`/match/${sessionId}`), 2000);
      }
    }
  }, [match, navigate, session, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  const onJoinMatch = (teamIdx: 0 | 1) => joinMatch(sessionId, teamIdx);
  const onStartMatch = () => startMatch();
  const onSetReady = () => setReady(sessionId, true);
  const onSetUnReady = () => setReady(sessionId, false);

  return (
    <Container>
      <Table
        match={match}
        fill={6}
        FillComponent={({ i }) => {
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
        Component={({ player }) => {
          return (
            <Box key={player.session} pt={4}>
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
                    <Button color="warning" onClick={onSetReady}>
                      Estoy Listo
                    </Button>
                  )
                ) : null}
              </Box>
              <Box>
                {isMe(player) && session === match.matchSessionId ? (
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
    </Container>
  );
};
