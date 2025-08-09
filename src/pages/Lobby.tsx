import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { trucoshi } from "../theme";
import { EMatchState, ILobbyOptions } from "trucoshi";
import { GameOptionsList } from "../components/game/GameOptionsList";
import { LoadingButton } from "../shared/LoadingButton";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { CardsDeck } from "../components/card/CardsDeck";
import { Link } from "../shared/Link";
import { Sats } from "../shared/Sats";

const OPTIONS_KEYS: (keyof ILobbyOptions)[] = [
  "matchPoint",
  "faltaEnvido",
  "maxPlayers",
  "turnTime",
  "flor",
];

export const Lobby = () => {
  useSound();
  const context = useContext(TrucoshiContext);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const { sessionId } = useParams<{ sessionId: string }>();

  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isReadyLoading, setReadyLoading] = useState(false);
  const [shuffle, setShuffle] = useState(0);

  const navigate = useNavigate();

  const [{ match, error }, { addBot, joinMatch, setReady, startMatch, setOptions, kickPlayer }] =
    useMatch(sessionId);

  const chatRoom = useChatRoom(match);

  const [, , , say] = chatRoom.useChatState;

  useEffect(() => {
    if (match) {
      if (match.state === EMatchState.STARTED || match.state === EMatchState.FINISHED) {
        match.state === EMatchState.STARTED ? setShuffle((c) => c + 1) : null;
        const timer = setTimeout(
          () => navigate(`/match/${sessionId}`, { replace: true }),
          match.state === EMatchState.FINISHED ? 0 : 2000
        );
        return () => clearTimeout(timer);
      }
    }
  }, [match, navigate, sessionId]);

  useEffect(() => {
    context.socket?.on("disconnect", () => {
      setReadyLoading(false);
    });
  }, [context.socket]);

  const onJoinMatch = (teamIdx: 0 | 1) => {
    setReadyLoading(true);
    sessionId && joinMatch(sessionId, () => setReadyLoading(false), teamIdx);
  };

  const onAddBot = (teamIdx: 0 | 1) => {
    setReadyLoading(true);
    sessionId && addBot(sessionId, () => setReadyLoading(false), teamIdx);
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

  const isMobile = useMediaQuery<typeof trucoshi>((theme) => theme.breakpoints.down("md"));

  return (
    <Box>
      <SocketBackdrop message="Conectandose a partida...">{sessionId}</SocketBackdrop>
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
                  <CardContent
                    sx={{
                      py: { xs: 0, sm: 1 },
                      px: 0,
                      pl: 0.5,
                      overflowY: "scroll",
                      maxHeight: "112%",
                    }}
                  >
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
                      keys={
                        context.state.account ? ["satsPerPlayer", ...OPTIONS_KEYS] : OPTIONS_KEYS
                      }
                      disablePadding={isMobile}
                    />
                  </CardContent>
                </Card>
              </Box>
            );
          }}
          FillSlot={({ i }) => {
            const getJoinTeamIdx = (j: number) => (j % 2 === 0 ? 0 : 1);

            const newTeamIdx = getJoinTeamIdx(i);
            const team0Count = match.players.filter((p) => p.teamIdx === 0).length;
            const team1Count = match.players.filter((p) => p.teamIdx === 1).length;
            const canJoin =
              match.players.length < match.options.maxPlayers &&
              (newTeamIdx === 0
                ? team0Count < match.options.maxPlayers / 2
                : team1Count < match.options.maxPlayers / 2);

            const canJoinBet =
              !match.options.satsPerPlayer ||
              (context.state.account?.wallet?.balanceInSats || 0) >= match.options.satsPerPlayer;

            return canJoin && canJoinBet ? (
              <Stack pt={2} alignItems="center">
                {newTeamIdx !== match?.me?.teamIdx ? (
                  <Button
                    variant="text"
                    disabled={isReadyLoading}
                    sx={{ whiteSpace: "wrap", maxWidth: "10em" }}
                    color={getTeamColor(newTeamIdx)}
                    onClick={() => onJoinMatch(newTeamIdx)}
                  >
                    Unirse a {getTeamName(newTeamIdx)}
                  </Button>
                ) : (
                  <Typography color={getTeamColor(newTeamIdx)}>
                    {getTeamName(newTeamIdx)}
                  </Typography>
                )}
                {match?.me?.isOwner && match.options.satsPerPlayer <= 0 ? (
                  <Button
                    variant="text"
                    disabled={isReadyLoading}
                    sx={{ whiteSpace: "wrap", maxWidth: "10em" }}
                    color="warning"
                    size="small"
                    onClick={() => onAddBot(newTeamIdx)}
                  >
                    Agregar Bot
                  </Button>
                ) : null}
              </Stack>
            ) : (
              canJoin && !canJoinBet && (
                <Stack pt={2} alignItems="center">
                  {context.state.account?.wallet ? (
                    <Typography color={getTeamColor(newTeamIdx)}>
                      Necesitas depositar sats para entrar
                    </Typography>
                  ) : (
                    <Button color={getTeamColor(newTeamIdx)} component={Link} to="/login">
                      Inicia Sesion para depositar Sats
                    </Button>
                  )}
                </Stack>
              )
            );
          }}
          Slot={({ player }) => {
            return (
              <Box pt={4}>
                <Box>
                  <PlayerTag say={say} isLobby isTurn={player.isMe} player={player} />
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
                      <>
                        {player.ready ? (
                          <Button
                            title="Click para dejar de estar listo"
                            disabled={isReadyLoading}
                            size="small"
                            color="success"
                            onClick={onSetUnReady}
                            endIcon={
                              <>
                                {player.ready &&
                                match.options.satsPerPlayer > 0 &&
                                context.state.account ? (
                                  <Sats variant="body2">{match.options.satsPerPlayer}</Sats>
                                ) : null}
                              </>
                            }
                          >
                            Listo
                          </Button>
                        ) : (
                          <AnimatedButton
                            title="Pone listo para empezar"
                            variant="contained"
                            disabled={isReadyLoading}
                            size="small"
                            color="warning"
                            onClick={onSetReady}
                          >
                            Estoy Listo
                          </AnimatedButton>
                        )}

                        {!match.me?.isOwner ? (
                          <Box pt={1}>
                            <Button
                              color="error"
                              size="small"
                              onClick={() => match.me && kickPlayer(match.me.key)}
                            >
                              Salir
                            </Button>
                          </Box>
                        ) : null}
                      </>
                    ) : (
                      <Box pt={1}>
                        {match.me?.isOwner ? (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => kickPlayer(player.key)}
                          >
                            Quitar
                          </Button>
                        ) : null}
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Stack px={2}>
                  {player.isOwner && player.isMe ? (
                    <LoadingButton
                      isLoading={isReadyLoading}
                      disabled={match.state !== EMatchState.READY}
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={onStartMatch}
                    >
                      {shuffle > 0 ? "Empezando..." : "Empezar Partida"}
                    </LoadingButton>
                  ) : null}
                </Stack>
              </Box>
            );
          }}
        />
      ) : (
        <FloatingProgress />
      )}

      <Box pt={2}>
        {match?.players.some((p) => p.bot) ? (
          <Typography color="text.disabled" fontSize="small">
            Las partidas con bots no suman victorias ni derrotas en el perfil.
          </Typography>
        ) : null}
      </Box>
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
        <ChatRoom {...chatRoom} />
      </FixedChatContainer>
      <Box display={{ xs: "none", md: "block" }}>
        <CardsDeck shuffle={shuffle} flip={shuffle > 0} />
      </Box>
    </Box>
  );
};
