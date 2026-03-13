import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { getTeamColor, getTeamName } from "../utils/team";
import { AnimatedButton } from "../shared/AnimatedButton";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { useChatRoom } from "../components/chat/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { FloatingProgress } from "../shared/FloatingProgress";
import { Settings } from "@mui/icons-material";
import { GameOptions } from "../components/game/GameOptions";
import { EMatchState, ILobbyOptions, IPublicPlayer } from "trucoshi";
import { GameOptionsList } from "../components/game/GameOptionsList";
import { LoadingButton } from "../shared/LoadingButton";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { Link } from "../shared/Link";
import { Sats } from "../shared/Sats";
import { GameCard } from "../components/card/GameCard";
import { BURNT_CARD } from "trucoshi";
import { UserAvatar } from "../shared/UserAvatar";
import { TrucoBoardLayout, buildAlternatingSlots } from "../components/game/TrucoBoardLayout";
import { CommDrawer } from "../components/chat/CommDrawer";

const OPTIONS_KEYS: (keyof ILobbyOptions)[] = [
  "matchPoint",
  "faltaEnvido",
  "maxPlayers",
  "turnTime",
  "flor",
];

const seatCardSx = {
  borderRadius: "0.95rem",
  p: 0.8,
  background: "rgba(17, 28, 24, 0.87)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.34)",
};

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
  useEffect(() => {
    if (match) {
      if (
        match.state === EMatchState.STARTED ||
        match.state === EMatchState.FINISHED ||
        match.state === EMatchState.PAUSED
      ) {
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

  const slots = useMemo(
    () =>
      match ? buildAlternatingSlots(match.players, match.options.maxPlayers) : buildAlternatingSlots([]),
    [match]
  );

  return (
    <Box
      sx={{
        height: { xs: "calc(100dvh - 50px)", md: "calc(100dvh - 102px)" },
        maxHeight: { xs: "calc(100dvh - 50px)", md: "calc(100dvh - 102px)" },
        overflow: "hidden",
      }}
    >
      <SocketBackdrop message="Conectandose a partida...">{sessionId}</SocketBackdrop>
      <MatchBackdrop error={error} />
      {match ? (
        <TrucoBoardLayout
          slots={slots}
          topContent={
            <>
              <Paper
                sx={{
                  px: 1.2,
                  py: 0.8,
                  borderRadius: "1rem",
                  background: "linear-gradient(170deg, rgba(17, 43, 35, 0.86), rgba(6, 25, 20, 0.86))",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <Typography fontSize="0.78rem" color="grey.300">
                  Lobby
                </Typography>
                <Typography fontSize="1rem" fontWeight={700} color="common.white">
                  {match.players.length} / {match.options.maxPlayers}
                </Typography>
              </Paper>
              <Paper
                sx={{
                  px: 1.6,
                  py: 0.8,
                  borderRadius: "0.9rem",
                  bgcolor: "rgba(12, 24, 19, 0.85)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <Typography color="common.white" fontWeight={700} fontSize="1rem">
                  Sala {sessionId}
                </Typography>
              </Paper>
              <IconButton
                sx={{
                  bgcolor: "rgba(16, 27, 22, 0.9)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
                onClick={() => setOptionsOpen(true)}
                disabled={match.busy || !match.me?.isOwner}
              >
                <Settings />
              </IconButton>
            </>
          }
          centerContent={
            <Paper
              sx={{
                width: "100%",
                maxWidth: "18rem",
                maxHeight: "100%",
                overflow: "auto",
                p: 1,
                borderRadius: "1rem",
                background: "rgba(10, 18, 15, 0.74)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography fontWeight={700} fontSize="0.9rem" textAlign="left" mb={0.4}>
                Reglas
              </Typography>
              <GameOptionsList
                dense
                options={match.options}
                keys={context.state.account ? ["satsPerPlayer", ...OPTIONS_KEYS] : OPTIONS_KEYS}
                disablePadding
              />
            </Paper>
          }
          renderSeat={(slot) => {
            if (!slot.player) {
              const team0Count = match.players.filter((p) => p.teamIdx === 0).length;
              const team1Count = match.players.filter((p) => p.teamIdx === 1).length;
              const canJoin =
                match.players.length < match.options.maxPlayers &&
                (slot.teamIdx === 0
                  ? team0Count < match.options.maxPlayers / 2
                  : team1Count < match.options.maxPlayers / 2);

              const canJoinBet =
                !match.options.satsPerPlayer ||
                (context.state.account?.wallet?.balanceInSats || 0) >= match.options.satsPerPlayer;

              return (
                <Paper sx={seatCardSx}>
                  <Typography color={`${getTeamColor(slot.teamIdx)}.light`} fontSize="0.77rem" mb={0.6}>
                    {getTeamName(slot.teamIdx)}
                  </Typography>
                  {canJoin && canJoinBet ? (
                    <Stack spacing={0.6}>
                      {slot.teamIdx !== match.me?.teamIdx ? (
                        <Button
                          variant="contained"
                          disabled={isReadyLoading}
                          color={getTeamColor(slot.teamIdx)}
                          size="small"
                          onClick={() => onJoinMatch(slot.teamIdx)}
                        >
                          Unirse
                        </Button>
                      ) : (
                        <Typography color="text.disabled" fontSize="0.74rem">
                          Espacio libre
                        </Typography>
                      )}
                      {match.me?.isOwner && match.options.satsPerPlayer <= 0 ? (
                        <Button
                          variant="outlined"
                          disabled={isReadyLoading}
                          color="warning"
                          size="small"
                          onClick={() => onAddBot(slot.teamIdx)}
                        >
                          Agregar Bot
                        </Button>
                      ) : null}
                    </Stack>
                  ) : canJoin && !canJoinBet ? (
                    <Stack spacing={0.6}>
                      {context.state.account?.wallet ? (
                        <Typography color={`${getTeamColor(slot.teamIdx)}.light`} fontSize="0.75rem">
                          Necesitas depositar sats
                        </Typography>
                      ) : (
                        <Button color={getTeamColor(slot.teamIdx)} component={Link} to="/login" size="small">
                          Inicia sesion
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    <Typography color="text.disabled" fontSize="0.75rem">
                      Completo
                    </Typography>
                  )}
                </Paper>
              );
            }

            const player: IPublicPlayer = slot.player;

            return (
              <Paper sx={seatCardSx}>
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <UserAvatar
                    account={player}
                    size="small"
                    bgcolor={`${getTeamColor(player.teamIdx)}.main`}
                  />
                  <Box minWidth={0}>
                    <Typography
                      color="common.white"
                      fontWeight={700}
                      fontSize="0.98rem"
                      noWrap
                      title={player.name}
                    >
                      {player.name}
                    </Typography>
                    <Typography fontSize="0.82rem" color="grey.300">
                      {player.ready ? "Listo" : "Esperando"}
                    </Typography>
                  </Box>
                </Stack>

                {!player.isMe ? (
                  <Stack direction="row" justifyContent="center" mt={0.6}>
                    {Array.from({ length: Math.min(player.hand.length || 3, 3) }).map((_, idx) => (
                      <Box key={`${player.key}-${idx}`} ml={idx ? -1.2 : 0}>
                        <GameCard disableButton card={BURNT_CARD} width="clamp(2.15rem, 7vw, 2.35rem)" shadow />
                      </Box>
                    ))}
                  </Stack>
                ) : null}

                <Stack mt={0.7} spacing={0.5}>
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
                            player.ready && match.options.satsPerPlayer > 0 && context.state.account ? (
                              <Sats variant="body2">{match.options.satsPerPlayer}</Sats>
                            ) : undefined
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
                        <Button
                          color="error"
                          size="small"
                          onClick={() => match.me && kickPlayer(match.me.key)}
                        >
                          Salir
                        </Button>
                      ) : null}
                    </>
                  ) : match.me?.isOwner ? (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => kickPlayer(player.key)}
                    >
                      Quitar
                    </Button>
                  ) : null}
                </Stack>
              </Paper>
            );
          }}
          bottomContent={
            <Stack spacing={1} pb={{ xs: "3.7rem", sm: "3.4rem", md: "3.2rem" }}>
              {match.me?.isOwner ? (
                <LoadingButton
                  isLoading={isReadyLoading}
                  disabled={match.state !== EMatchState.READY}
                  variant="contained"
                  color="success"
                  onClick={onStartMatch}
                >
                  {shuffle > 0 ? "Empezando..." : "Empezar Partida"}
                </LoadingButton>
              ) : (
                <Paper
                  sx={{
                    p: 1,
                    borderRadius: "0.8rem",
                    bgcolor: "rgba(18, 27, 23, 0.84)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography fontSize="0.86rem" color="grey.300" textAlign="center">
                    Esperando al host para empezar la partida
                  </Typography>
                </Paper>
              )}
            </Stack>
          }
          boardFooter={
            match?.players.some((p) => p.bot) ? (
              <Typography color="text.disabled" fontSize="small">
                Las partidas con bots no suman victorias ni derrotas en el perfil.
              </Typography>
            ) : undefined
          }
        />
      ) : (
        <FloatingProgress />
      )}

      {isOptionsOpen && match ? (
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
      ) : null}

      <CommDrawer chatProps={chatRoom} />
    </Box>
  );
};
