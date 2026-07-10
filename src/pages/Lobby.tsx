import { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "@tanstack/react-router";
import { useMatch } from "../trucoshi/hooks/useMatch";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { useChatRoom } from "../components/chat/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { FloatingProgress } from "../shared/FloatingProgress";
import { ContentCopy, Settings } from "@mui/icons-material";
import { GameOptions } from "../components/game/GameOptions";
import { EMatchState, ILobbyOptions } from "trucoshi";
import { GameOptionsList } from "../components/game/GameOptionsList";
import { LoadingButton } from "../shared/LoadingButton";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { TrucoBoardLayout, buildAlternatingSlots } from "../components/game/TrucoBoardLayout";
import { CommDrawer } from "../components/chat/CommDrawer";
import { BoardLayoutProvider, MatchStateProvider } from "../board";
import { LobbySeatCard } from "../components/game/LobbySeatCard";
import { DevProfiler } from "../utils/devProfiler";
import { GameBoardSceneFrame } from "../components/game/GameBoardSceneFrame";
import { LobbyGameplayProvider, useLobbyGameplay } from "../components/game/LobbyGameplayContext";
import { useToast } from "../hooks/useToast";

const OPTIONS_KEYS: (keyof ILobbyOptions)[] = [
  "matchPoint",
  "faltaEnvido",
  "maxPlayers",
  "turnTime",
  "flor",
];

const copyTextToClipboard = async (text: string) => {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.navigator.clipboard?.writeText) {
    try {
      await window.navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back below for browsers that expose clipboard but reject the call.
    }
  }

  const textarea = window.document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  window.document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return window.document.execCommand("copy");
  } catch {
    return false;
  } finally {
    window.document.body.removeChild(textarea);
  }
};

const LobbyBoardScene = memo(() => {
  const {
    state: { match, chatProps, slots, isDesktopChat, account, isReadyLoading, sessionId },
    actions: { onStartMatch, onOpenOptions },
  } = useLobbyGameplay();
  const showNoticeBannerInChat = !match.createdFromQueue;
  const toast = useToast();

  const copyLobbyUrl = () => {
    if (!sessionId || typeof window === "undefined") {
      toast.warning("No se pudo copiar el link");
      return;
    }

    copyTextToClipboard(`${window.location.origin}/lobby/${sessionId}`).then((copied) => {
      if (copied) {
        toast.success("Link de sala copiado");
      } else {
        toast.error("No se pudo copiar el link");
      }
    });
  };

  return (
    <GameBoardSceneFrame
      chatProps={chatProps}
      isDesktopChat={isDesktopChat}
      showNoticeBannerInChat={showNoticeBannerInChat}
    >
      <DevProfiler id="Lobby.Board">
        <TrucoBoardLayout
          slots={slots}
          topContent={
            <>
              <Paper
                sx={(theme) => ({
                  ...theme.trucoshiUi.lobby.topPlayersCard,
                  px: 1.2,
                  py: 0.8,
                  borderRadius: "1rem",
                })}
              >
                <Typography fontSize="0.78rem" color="grey.300">
                  Lobby
                </Typography>
                <Typography fontSize="1rem" fontWeight={700} color="common.white">
                  {match.players.length} / {match.options.maxPlayers}
                </Typography>
              </Paper>

              <Paper
                sx={(theme) => ({
                  ...theme.trucoshiUi.lobby.topSessionCard,
                  px: 1.6,
                  py: 0.8,
                  borderRadius: "0.9rem",
                })}
              >
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography color="common.white" fontWeight={700} fontSize="1rem">
                    Sala {sessionId}
                  </Typography>
                  <Tooltip title="Copiar link de sala">
                    <IconButton
                      aria-label="Copiar link de sala"
                      color="inherit"
                      onClick={copyLobbyUrl}
                      size="small"
                      sx={{
                        color: "common.white",
                        p: 0.25,
                      }}
                    >
                      <ContentCopy sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>

              <IconButton
                sx={(theme) => theme.trucoshiUi.lobby.topSettingsButton}
                onClick={onOpenOptions}
                disabled={match.busy || !match.me?.isOwner}
              >
                <Settings />
              </IconButton>
            </>
          }
          centerContent={
            <Paper
              sx={(theme) => ({
                ...theme.trucoshiUi.lobby.rulesPanel,
                width: "100%",
                maxWidth: "18rem",
                maxHeight: "100%",
                overflow: "auto",
                p: 1,
                borderRadius: "1rem",
              })}
            >
              <Typography fontWeight={700} fontSize="0.9rem" textAlign="left" mb={0.4}>
                Reglas
              </Typography>
              <GameOptionsList
                dense
                options={match.options}
                keys={account ? ["satsPerPlayer", ...OPTIONS_KEYS] : OPTIONS_KEYS}
                disablePadding
              />
            </Paper>
          }
          renderSeat={(slot) => <LobbySeatCard slot={slot} />}
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
                  sx={(theme) => ({
                    ...theme.trucoshiUi.lobby.waitingHostCard,
                    p: 1,
                    borderRadius: "0.8rem",
                  })}
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
      </DevProfiler>
    </GameBoardSceneFrame>
  );
});

LobbyBoardScene.displayName = "LobbyBoardScene";

export const Lobby = () => {
  useSound();

  const context = useContext(TrucoshiContext);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const { sessionId } = useParams({ from: "/lobby/$sessionId" });

  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const [isReadyLoading, setReadyLoading] = useState(false);
  const theme = useTheme();
  const isDesktopChat = useMediaQuery(theme.breakpoints.up("lg"));

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

  const onJoinMatch = useCallback(
    (teamIdx: 0 | 1) => {
      setReadyLoading(true);
      if (sessionId) {
        joinMatch(sessionId, () => setReadyLoading(false), teamIdx);
      }
    },
    [joinMatch, sessionId],
  );

  const onAddBot = useCallback(
    (teamIdx: 0 | 1) => {
      setReadyLoading(true);
      if (sessionId) {
        addBot(sessionId, () => setReadyLoading(false), teamIdx);
      }
    },
    [addBot, sessionId],
  );

  const onStartMatch = useCallback(() => {
    setReadyLoading(true);
    startMatch(() => setReadyLoading(false));
  }, [startMatch]);

  const onSetReady = useCallback(() => {
    setReadyLoading(true);
    if (sessionId) {
      setReady(sessionId, true, () => setReadyLoading(false));
    }
  }, [sessionId, setReady]);

  const onSetUnReady = useCallback(() => {
    setReadyLoading(true);
    if (sessionId) {
      setReady(sessionId, false, () => setReadyLoading(false));
    }
  }, [sessionId, setReady]);

  const onOpenOptions = useCallback(() => setOptionsOpen(true), []);

  const slots = useMemo(
    () =>
      match
        ? buildAlternatingSlots(match.players, match.options.maxPlayers)
        : buildAlternatingSlots([]),
    [match],
  );

  if (shouldRedirectToMatch) {
    return <Navigate to="/match/$sessionId" params={{ sessionId }} replace />;
  }

  return (
    <MatchStateProvider match={match}>
      <BoardLayoutProvider surface="lobby" totalSeats={slots.length}>
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
            <LobbyGameplayProvider
              state={{
                match,
                chatProps: chatRoom,
                slots,
                isDesktopChat,
                account: context.state.account,
                isReadyLoading,
                sessionId,
              }}
              actions={{
                onJoinMatch,
                onAddBot,
                onSetReady,
                onSetUnReady,
                onStartMatch,
                onOpenOptions,
                kickPlayer,
              }}
            >
              <LobbyBoardScene />
              {!isDesktopChat ? (
                <CommDrawer chatProps={chatRoom} showNoticeBanner={!match.createdFromQueue} />
              ) : null}
            </LobbyGameplayProvider>
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
        </Box>
      </BoardLayoutProvider>
    </MatchStateProvider>
  );
};
