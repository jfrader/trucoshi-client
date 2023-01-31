import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { EMatchTableState } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshi } from "../hooks/useTrucoshi";
import { useMatch } from "../hooks/useMatch";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

export const Lobby = () => {
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [me, setMe] = useState<IPublicPlayer | null>(null);

  const navigate = useNavigate();

  const [match, , { joinMatch, setReady, startMatch }] = useMatch(sessionId);

  useEffect(() => {
    if (match) {
      const me = match.players.find((p) => p.session === session);
      if (me) {
        setMe(me);
      }
      if (match.state !== EMatchTableState.UNREADY) {
        navigate(`/match/${sessionId}`);
      }
    }
  }, [match, navigate, session, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  const onJoinMatch = () => joinMatch(sessionId);
  const onStartMatch = () => startMatch();
  const onSetReady = () => setReady(sessionId, true);
  const onSetUnReady = () => setReady(sessionId, false);

  return (
    <Box>
      <Paper>
        <List>
          {match.players.map((player) => (
            <ListItem key={player.session}>
              <ListItemText
                secondary={
                  <Typography color={player.ready ? "success" : "error"}>
                    {player.ready ? "Listo" : "Esperando"}
                  </Typography>
                }
              >
                <Typography variant="h5">{player.id}</Typography>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box>
        {me ? (
          <div>
            {me.ready ? (
              <Button variant="contained" color="error" onClick={onSetUnReady}>
                No estoy listo
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={onSetReady}>
                Estoy listo
              </Button>
            )}
          </div>
        ) : (
          <Box mt={2}>
            <Button variant="contained" color="success" onClick={onJoinMatch}>
              Unirse
            </Button>
          </Box>
        )}
      </Box>
      <Box>
        {session === sessionId ? (
          <Button variant="contained" color="success" onClick={onStartMatch}>
            Empezar Partida
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};
