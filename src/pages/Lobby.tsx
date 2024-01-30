import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { GameTable } from "../components/game/GameTable";
import { PlayerTag } from "../components/game/PlayerTag";
import { getTeamColor, getTeamName } from "../utils/team";
import { AnimatedButton } from "../shared/AnimatedButton";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { FixedChatContainer, ChatRoom, useChatRoom } from "../components/chat/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { FloatingProgress } from "../shared/FloatingProgress";
import { Settings } from "@mui/icons-material";
import { Sats } from "../shared/Sats";
import { GameOptions } from "../components/game/GameOptions";
import { dark } from "../theme";
import { EMatchState } from "trucoshi";

export const Lobby = () => {
  useSound();
  const [{ account }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [isOptionsOpen, setOptionsOpen] = useState(false);

  const navigate = useNavigate();

  const [{ match, me, error }, { joinMatch, setReady, startMatch, setOptions, kickPlayer }] =
    useMatch(sessionId);

  useEffect(() => {
    if (match) {
      if (match.state === EMatchState.STARTED || match.state === EMatchState.FINISHED) {
        setTimeout(() => navigate(`/match/${sessionId}`, { replace: true }));
      }
      return;
    }
  }, [match, navigate, sessionId]);

  const onJoinMatch = (teamIdx: 0 | 1) => sessionId && joinMatch(sessionId, teamIdx);
  const onStartMatch = () => startMatch();
  const onSetReady = () => sessionId && setReady(sessionId, true);
  const onSetUnReady = () => sessionId && setReady(sessionId, false);

  const isMobile = useMediaQuery<typeof dark>((theme) => theme.breakpoints.down("md"));

  return (
    <Box>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match ? (
        <GameTable
          match={match}
          zoomOnMiddle
          zoomFactor={1.35}
          fill={match.options.maxPlayers}
          MiddleSlot={() => {
            return (
              <Box width="100%" height="100%" display="flex" fontSize="small">
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    pl: 1,
                    fontSize: { xs: "10px", sm: "11px", md: "12px" },
                  }}
                  variant="outlined"
                >
                  <CardContent sx={{ py: 1, px: 0, pl: 0.5 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      pr={1}
                    >
                      <Typography textAlign="left" fontWeight="bold">
                        Reglas
                      </Typography>
                      {match.busy || !match.me?.isOwner ? null : (
                        <IconButton size="small" onClick={() => setOptionsOpen(true)}>
                          <Settings fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                    <List disablePadding={isMobile}>
                      {account ? (
                        <ListItem disablePadding>
                          <ListItemText disableTypography>Sats por jugador</ListItemText>
                          <ListItemSecondaryAction>
                            <Sats>{match.options.satsPerPlayer}</Sats>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ) : null}
                      <ListItem disablePadding>
                        <ListItemText disableTypography>Max. Jugadores</ListItemText>
                        <ListItemSecondaryAction>
                          {match.options.maxPlayers}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText disableTypography>Puntos por Etapa</ListItemText>
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
              <Stack pt={3} alignItems="end">
                <Button
                  variant="text"
                  sx={{ whiteSpace: 'wrap', maxWidth: '10em' }}
                  color={getTeamColor(joinTeamIdx)}
                  onClick={() => onJoinMatch(joinTeamIdx)}
                >
                  Unirse a {getTeamName(joinTeamIdx)}
                </Button>
              </Stack>
            ) : null;
          }}
          Slot={({ player }) => {
            return (
              <Box pt={4}>
                <Box>
                  <PlayerTag isTurn={player.isMe} player={player} />
                  <Stack px={2} pt={2}>
                    {player.isMe ? null : (
                      <Button
                        size="small"
                        color={player.ready && !player.disabled ? "success" : "warning"}
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
                    ) : (
                      <>
                        {match.ownerKey === match.me?.key ? (
                          <Button color="error" size="small" onClick={() => kickPlayer(player.key)}>
                            Quitar
                          </Button>
                        ) : null}
                      </>
                    )}
                  </Stack>
                </Box>
                <Stack px={2}>
                  {player.isOwner && player.isMe ? (
                      <Button
                        disabled={match.state !== EMatchState.READY}
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={onStartMatch}
                      >
                        Empezar Partida
                      </Button>
                  ) : null}
                </Stack>
              </Box>
            );
          }}
        />
      ) : (
        <FloatingProgress />
      )}
      {isOptionsOpen && match && (
        <Dialog open={isOptionsOpen} onClose={() => setOptionsOpen(false)}>
          <DialogTitle>Reglas de la partida</DialogTitle>
          <DialogContent>
            <GameOptions
              defaultValues={match.options}
              onClose={() => setOptionsOpen(false)}
              onSubmit={(o) => setOptions(o, () => setOptionsOpen(false))}
            />
          </DialogContent>
        </Dialog>
      )}
      <FixedChatContainer>
        <ChatRoom {...useChatRoom(match)} />
      </FixedChatContainer>
    </Box>
  );
};
