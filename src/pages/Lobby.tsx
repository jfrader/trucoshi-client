import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { useChatRoom } from "../components/chat/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { FloatingProgress } from "../shared/FloatingProgress";
import { Settings } from "@mui/icons-material";
import { GameOptions } from "../components/game/GameOptions";
import { EMatchState, ILobbyOptions } from "trucoshi";
import { GameOptionsList } from "../components/game/GameOptionsList";
import { LoadingButton } from "../shared/LoadingButton";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { TrucoBoardLayout, buildAlternatingSlots } from "../components/game/TrucoBoardLayout";
import { CommDrawer } from "../components/chat/CommDrawer";
import { useBoardLayoutModel } from "../components/game/boardLayoutPresets";
import { LobbySeatCard } from "../components/game/LobbySeatCard";

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

  const [{ match, error }, { addBot, joinMatch, setReady, startMatch, setOptions, kickPlayer }] =
    useMatch(sessionId);

  const chatRoom = useChatRoom(match);

  const shouldRedirectToMatch = Boolean(
    match &&
    (match.state === EMatchState.STARTED ||
      match.state === EMatchState.FINISHED ||
      match.state === EMatchState.PAUSED) &&
    sessionId,
  );

  useEffect(() => {
    const onDisconnect = () => {
      setReadyLoading(false);
    };

    context.socket?.on("disconnect", onDisconnect);

    return () => {
      context.socket?.off("disconnect", onDisconnect);
    };
  }, [context.socket]);

  const onJoinMatch = (teamIdx: 0 | 1) => {
    setReadyLoading(true);
    if (sessionId) {
      joinMatch(sessionId, () => setReadyLoading(false), teamIdx);
    }
  };

  const onAddBot = (teamIdx: 0 | 1) => {
    setReadyLoading(true);
    if (sessionId) {
      addBot(sessionId, () => setReadyLoading(false), teamIdx);
    }
  };

  const onStartMatch = () => {
    setReadyLoading(true);
    startMatch(() => setReadyLoading(false));
  };

  const onSetReady = () => {
    setReadyLoading(true);
    if (sessionId) {
      setReady(sessionId, true, () => setReadyLoading(false));
    }
  };

  const onSetUnReady = () => {
    setReadyLoading(true);
    if (sessionId) {
      setReady(sessionId, false, () => setReadyLoading(false));
    }
  };

  const slots = useMemo(
    () =>
      match
        ? buildAlternatingSlots(match.players, match.options.maxPlayers)
        : buildAlternatingSlots([]),
    [match],
  );

  const boardLayout = useBoardLayoutModel({
    surface: "lobby",
    totalSeats: slots.length,
  });

  if (shouldRedirectToMatch) {
    return <Navigate to={`/match/${sessionId}`} replace />;
  }

  return (
    <Box
      sx={{
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      <SocketBackdrop message="Conectandose a partida...">{sessionId}</SocketBackdrop>
      <MatchBackdrop error={error} />

      {match ? (
        <TrucoBoardLayout
          slots={slots}
          layout={boardLayout}
          topContent={
            <>
              <Paper
                sx={{
                  px: 1.2,
                  py: 0.8,
                  borderRadius: "1rem",
                  background:
                    "linear-gradient(170deg, rgba(17, 43, 35, 0.86), rgba(6, 25, 20, 0.86))",
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
            const seatCard = boardLayout.lobby?.seatCard;

            if (!seatCard) {
              return null;
            }

            return (
              <LobbySeatCard
                slot={slot}
                match={match}
                seatCard={seatCard}
                account={context.state.account}
                isReadyLoading={isReadyLoading}
                onJoinMatch={onJoinMatch}
                onAddBot={onAddBot}
                onSetReady={onSetReady}
                onSetUnReady={onSetUnReady}
                onKickPlayer={kickPlayer}
              />
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
                  Empezar Partida
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
            <Typography color="text.disabled" fontSize="small">
              {match.players.some((player) => player.bot)
                ? "Las partidas con bots no suman victorias ni derrotas en el perfil."
                : "Todos deben estar listos para empezar"}
            </Typography>
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
              onSubmit={(options) => setOptions(options, () => setOptionsOpen(false))}
            />
          </DialogContent>
        </Dialog>
      ) : null}

      <CommDrawer chatProps={chatRoom} />
    </Box>
  );
};
