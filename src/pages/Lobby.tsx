import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { GameTable } from "../components/GameTable";
import { PlayerTag } from "../components/PlayerTag";
import { getTeamColor, getTeamName } from "../utils/team";
import { EMatchState } from "trucoshi";
import { AnimatedButton } from "../shared/AnimatedButton";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { FixedChatContainer, ChatRoom, useChatRoom } from "../components/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { FloatingProgress } from "../shared/FloatingProgress";
import { Settings } from "@mui/icons-material";

export const Lobby = () => {
  useSound();
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const [{ match, me, error }, { joinMatch, setReady, startMatch }] = useMatch(sessionId);

  useEffect(() => {
    if (match) {
      if (match.state === EMatchState.STARTED || match.state === EMatchState.FINISHED) {
        setTimeout(() => navigate(`/match/${sessionId}`, { replace: true }));
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
          zoomOnMiddle
          zoomFactor={1.3}
          fill={match.options.maxPlayers}
          MiddleSlot={() => {
            return (
              <Box width="100%" height="100%" display="flex">
                <Card sx={{ zoom: 0.8, width: "100%", pl: 1 }} variant="outlined">
                  <CardContent sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography textAlign="left" fontWeight="bold">
                        Reglas
                      </Typography>
                      <IconButton>
                        <Settings />
                      </IconButton>
                    </Stack>
                    <List dense>
                      <ListItem disablePadding>
                        <ListItemText>Max. Jugadores</ListItemText>
                        <ListItemSecondaryAction>
                          {match.options.maxPlayers}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText>Puntos por Etapa</ListItemText>
                        <ListItemSecondaryAction>
                          {match.options.matchPoint}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            );
          }}
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
      <FixedChatContainer>
        <ChatRoom {...useChatRoom(match)} />
      </FixedChatContainer>
    </Box>
  );
};
