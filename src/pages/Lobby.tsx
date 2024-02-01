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
import { GameOptions } from "../components/game/GameOptions";
import { dark } from "../theme";
import { EMatchState, ILobbyOptions } from "trucoshi";
import { GameOptionsList } from "../components/game/GameOptionsList";
import { LoadingButton } from "../shared/LoadingButton";

const OPTIONS_KEYS: (keyof ILobbyOptions)[] = ["matchPoint", "faltaEnvido", "maxPlayers"];

export const Lobby = () => {
  useSound();
  const [{ account }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isReadyLoading, setReadyLoading] = useState(false);

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

  const onJoinMatch = (teamIdx: 0 | 1) => {
    setReadyLoading(true);
    sessionId && joinMatch(sessionId, () => setReadyLoading(false), teamIdx);
  };

  const onStartMatch = () => {
    setReadyLoading(true);
    startMatch(() => setReadyLoading(false));
  };

  const onSetReady = () => {
    setReadyLoading(true);
    sessionId && setReady(sessionId, true, () => setReadyLoading(false));
  };

  const onSetUnReady = () => {
    setReadyLoading(true);
    sessionId && setReady(sessionId, false, () => setReadyLoading(false));
  };

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
                    <GameOptionsList
                      dense
                      options={match.options}
                      keys={account ? ["satsPerPlayer", ...OPTIONS_KEYS] : OPTIONS_KEYS}
                      disablePadding={isMobile}
                    />
                  </CardContent>
                </Card>
              </Box>
            );
          }}
          FillSlot={({ i }) => {
            const getJoinTeamIdx = (j: number) => (j % 2 === 0 ? 0 : 1);

            const firstPlayerTeamIsZero =
              me?.teamIdx === 0 || (!me && match.players[0]?.teamIdx === 0);

            const joinTeamIdx = getJoinTeamIdx(i);
            const newTeamIdx = firstPlayerTeamIsZero ? joinTeamIdx : getJoinTeamIdx(i + 1);
            const canJoin =
              match.players.filter((p) => p.teamIdx === newTeamIdx).length <
              match.options.maxPlayers / 2;

            return canJoin && (!me || newTeamIdx !== me.teamIdx) ? (
              <Stack pt={3} alignItems="end">
                <LoadingButton
                  variant="text"
                  isLoading={isReadyLoading}
                  sx={{ whiteSpace: "wrap", maxWidth: "10em" }}
                  color={getTeamColor(newTeamIdx)}
                  onClick={() => onJoinMatch(newTeamIdx)}
                >
                  Unirse a {getTeamName(newTeamIdx)}
                </LoadingButton>
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
                        <LoadingButton
                          isLoading={isReadyLoading}
                          size="small"
                          color="success"
                          onClick={onSetUnReady}
                        >
                          Listo
                        </LoadingButton>
                      ) : (
                        <AnimatedButton
                          isLoading={isReadyLoading}
                          size="small"
                          color="warning"
                          onClick={onSetReady}
                        >
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
