import {
  alpha,
  Box,
  Button,
  ButtonGroup,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { EFlorCommand, EMatchState, ICard } from "trucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { useChatRoom } from "../components/chat/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { FloatingProgress } from "../shared/FloatingProgress";
import { Backdrop } from "../shared/Backdrop";
import { MatchFinishedScreen } from "../components/game/MatchFinishedScreen";
import { getTeamColor } from "../utils/team";
import { debugComponent } from "../utils/debugComponent";
import Toasty from "../components/game/Toasty";
import { GameOptionsList } from "../components/game/GameOptionsList";
import { Pause, VideogameAsset, Visibility } from "@mui/icons-material";
import { useToast } from "../hooks/useToast";
import CircularProgress from "@mui/material/CircularProgress";
import { useConfirmationModal } from "../hooks/useConfirmationModal";
import { ConfirmationModal } from "../shared/ConfirmationModal";
import { TrucoBoardLayout, buildAlternatingSlots } from "../components/game/TrucoBoardLayout";
import { CommDrawer } from "../components/chat/CommDrawer";
import { DesktopCommRail } from "../components/chat/DesktopCommRail";
import { MatchSeatCard } from "../components/game/MatchSeatCard";
import { TrickCenter } from "../components/game/TrickCenter";
import {
  getMatchSeatPresentationForIndex,
  useBoardLayoutModel,
} from "../components/game/boardLayoutPresets";
import { MatchTopBar } from "../components/game/MatchTopBar";
import { MatchBottomDock } from "../components/game/MatchBottomDock";

const spectatorTooltipSx = (theme: any) => ({
  position: "fixed",
  right: "1em",
  bottom: "calc(env(safe-area-inset-bottom) + 4.1rem)",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  bgcolor: alpha(theme.palette.background.paper, 0.5),
  [theme.breakpoints.up("sm")]: {
    bottom: "1.3em",
  },
});

const AbandonDialog = ({
  open,
  onClose,
  onAbandon,
}: {
  open: boolean;
  onClose: () => void;
  onAbandon: () => void;
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Atencion</DialogTitle>
    <DialogContent>
      <Typography>Estas a punto de abandonar la partida</Typography>
    </DialogContent>
    <DialogContent>
      <Stack direction="row" width="100%" justifyContent="center" gap={2}>
        <Button color="success" onClick={onClose}>
          Continuar Partida
        </Button>
        <Button color="error" onClick={onAbandon}>
          Rendirse
        </Button>
      </Stack>
    </DialogContent>
  </Dialog>
);

const RulesDialog = ({
  open,
  onClose,
  options,
}: {
  open: boolean;
  onClose: () => void;
  options?: any;
}) => (
  <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
    <DialogTitle>Reglas de la Partida</DialogTitle>
    <DialogContent>{options && <GameOptionsList options={options} />}</DialogContent>
    <DialogActions>
      <Stack direction="row" width="100%" justifyContent="center" gap={2}>
        <Button fullWidth color="success" onClick={onClose}>
          Continuar Partida
        </Button>
      </Stack>
    </DialogActions>
  </Dialog>
);

const pointsLabel = (points: { buenas: number; malas: number }) => points.buenas || points.malas;

const _Match = () => {
  const [{ serverAheadTime }, , , hydrated] = useTrucoshi();
  const [isAbandonOpen, setAbandonOpen] = useState(false);
  const [isRulesOpen, setRulesOpen] = useState(false);
  const [unpauseAt, setUnpauseAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pauseRequested, setPauseRequested] = useState(false);
  const [animateAnnouncement, setAnimateAnnouncement] = useState(false);
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();
  const theme = useTheme();
  const isDesktopChat = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const toast = useToast();
  const confirmation = useConfirmationModal();

  const onPlayAgain = () => {
    playAgain((newMatchSessionId) => {
      toast.closeSnackbar("playagain");
      if (newMatchSessionId) {
        navigate(`/lobby/${newMatchSessionId}`);
      }
    });
  };

  const [
    { match, stats, error, canSay, canPlay, me },
    { playCard, sayCommand, leaveMatch, pauseMatch, playAgain },
  ] = useMatch(sessionId, {
    onMyTurn: () => queue("turn"),
    onFreshHand: () => queue("round"),
    onPlayAgainRequest(expiresAt) {
      toast.success("Jugar otra partida?", {
        key: "playagain",
        preventDuplicate: true,
        autoHideDuration: Math.max((expiresAt || 0) - (Date.now() + serverAheadTime), 5000),
        anchorOrigin: { horizontal: "left", vertical: "top" },
        iconVariant: { success: <VideogameAsset /> },
        onClose(_event, reason) {
          if (reason !== "instructed") {
            toast.closeSnackbar("playagain");
          }
        },
        action: (
          <ButtonGroup size="small" variant="contained" color="success">
            <Button onClick={onPlayAgain}>Aceptar</Button>
            <Button color="error" onClick={() => toast.closeSnackbar("playagain")}>
              Cerrar
            </Button>
          </ButtonGroup>
        ),
      });
    },
    onPauseRequest(fromOpponent, expiresAt, answer) {
      if (fromOpponent) {
        toast.success("El oponente quiere una pausa", {
          preventDuplicate: true,
          autoHideDuration: Math.max((expiresAt || 0) - (Date.now() + serverAheadTime), 5000),
          anchorOrigin: { horizontal: "left", vertical: "top" },
          iconVariant: { success: <Pause /> },
          onClose(_event, reason) {
            if (reason !== "instructed") {
              answer(false);
            }
          },
          action: (
            <ButtonGroup size="small" variant="contained" color="success">
              <Button onClick={() => answer(true)}>Pausar</Button>
              <Button color="error" onClick={() => answer(false)}>
                Rechazar
              </Button>
            </ButtonGroup>
          ),
        });
      } else {
        setPauseRequested(true);
      }
    },
    onUnpause(unpausesAt) {
      if (unpausesAt === 0) {
        setPauseRequested(false);
        return;
      }

      queue("menu1");

      const now = Date.now() + serverAheadTime;
      const total = unpausesAt - now;

      if (total > 0) {
        setUnpauseAt(unpausesAt);
        setProgress(100);
        setSecondsLeft(Math.ceil(total / 1000));
      } else {
        setUnpauseAt(null);
        setProgress(100);
        setSecondsLeft(0);
      }
    },
  });

  useEffect(() => {
    if (!unpauseAt) {
      return;
    }

    const startTime = Date.now() + serverAheadTime;
    const totalDuration = unpauseAt - startTime;

    if (totalDuration <= 0) {
      setUnpauseAt(null);
      setProgress(100);
      setSecondsLeft(0);
      return;
    }

    let prevSeconds = Math.ceil(totalDuration / 1000);

    const interval = setInterval(() => {
      const currentNow = Date.now() + serverAheadTime;
      const elapsed = currentNow - startTime;
      const newProgress = Math.max(0, (1 - elapsed / totalDuration) * 100);
      const newSecondsLeft = Math.ceil((unpauseAt - currentNow) / 1000);

      if (newSecondsLeft !== prevSeconds && newSecondsLeft > 0) {
        queue("back");
        prevSeconds = newSecondsLeft;
      }

      if (currentNow >= unpauseAt) {
        clearInterval(interval);
        setUnpauseAt(null);
        setProgress(100);
        setSecondsLeft(0);
      } else {
        setProgress(newProgress);
        setSecondsLeft(newSecondsLeft);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [unpauseAt, serverAheadTime, queue]);

  const chatProps = useChatRoom(match);
  const room = chatProps.useChatState[0];

  const announcements = useMemo(
    () => (room?.messages || []).filter((message) => message.command || message.system).slice(-40),
    [room?.messages]
  );

  const latestAnnouncement = announcements[announcements.length - 1] || chatProps.latestMessage;
  const previousAnnouncement = announcements.length > 1 ? announcements[announcements.length - 2] : null;
  const thirdAnnouncement = announcements.length > 2 ? announcements[announcements.length - 3] : null;

  const latestAnnouncementColor =
    latestAnnouncement?.command && latestAnnouncement?.user?.key !== undefined
      ? `${getTeamColor(Number(latestAnnouncement.user.key))}.light`
      : "grey.100";

  const previousAnnouncementColor =
    previousAnnouncement?.command && previousAnnouncement?.user?.key !== undefined
      ? `${getTeamColor(Number(previousAnnouncement.user.key))}.light`
      : "grey.400";

  const thirdAnnouncementColor =
    thirdAnnouncement?.command && thirdAnnouncement?.user?.key !== undefined
      ? `${getTeamColor(Number(thirdAnnouncement.user.key))}.light`
      : "grey.500";

  const [rounds] = useRounds(match);
  const slots = useMemo(() => (match ? buildAlternatingSlots(match.players) : []), [match]);

  const boardLayout = useBoardLayoutModel({
    surface: "match",
    totalSeats: slots.length,
  });

  const myTeamIdx = me?.teamIdx ?? 0;

  const canInteractWithHand = Boolean(canPlay && me?.isTurn && !me?.disabled && !me?.abandoned);

  const hasCommandActions = Boolean(
    me &&
      canSay &&
      ((me.isEnvidoTurn && (me.envido?.length || 0) > 0) || (me.commands?.length || 0) > 0)
  );

  useEffect(() => {
    if (!latestAnnouncement?.id) {
      return;
    }

    setAnimateAnnouncement(true);

    const timer = setTimeout(() => {
      setAnimateAnnouncement(false);
    }, 520);

    return () => clearTimeout(timer);
  }, [latestAnnouncement?.id]);

  const onPlayCard = useCallback(
    (card: ICard, cardIdx: number) => {
      if (!me) {
        return;
      }

      if ((me.commands || []).includes(EFlorCommand.FLOR)) {
        confirmation.onOpen({
          title: "Atencion",
          body: "Si jugas esta carta vas a perder tu flor!",
          acceptLabel: "Jugar de todas formas",
          onConfirm: () => playCard(cardIdx, card),
        });
        return;
      }

      playCard(cardIdx, card);
    },
    [confirmation, me, playCard]
  );

  const shouldRedirectToLobby = Boolean(
    match &&
      (match.state === EMatchState.UNREADY || match.state === EMatchState.READY) &&
      sessionId
  );

  if (!hydrated) {
    return (
      <Container maxWidth="sm">
        <Backdrop open loading message="Cargando..." />
      </Container>
    );
  }

  if (!sessionId) {
    return (
      <Container maxWidth="sm">
        <Backdrop open message="Partida no encontrada" />
      </Container>
    );
  }

  if (shouldRedirectToLobby) {
    return <Navigate to={`/lobby/${sessionId}`} replace />;
  }

  if (match?.winner) {
    return (
      <MatchFinishedScreen
        onPlayAgain={onPlayAgain}
        match={match}
        chatProps={chatProps}
        error={error}
      />
    );
  }

  const pauseWithProgress = (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" value={progress} size={60} thickness={4} color="success" />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pause color="success" fontSize="large" />
      </Box>
    </Box>
  );

  const buttonText = unpauseAt ? `Reanudando partida en ${secondsLeft}` : "Reanudar";
  const matchDock = boardLayout.match?.dock;
  const useShortPhoneChatDockButton =
    boardLayout.profile === "phoneWide" ||
    (boardLayout.profile === "phoneTall" && boardLayout.viewport.height <= 860);
  const compactDockBottomOffset = useShortPhoneChatDockButton
    ? "calc(env(safe-area-inset-bottom) + 0.28rem)"
    : undefined;

  return (
    <Box
      flexGrow={1}
      maxWidth="100%"
      position="relative"
      sx={{
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      <SocketBackdrop message="Conectandose a partida...">{sessionId}</SocketBackdrop>
      <MatchBackdrop error={error} />

      <Backdrop hideLogo message="Pausa" opacity={0.66} showChat open={match?.state === EMatchState.PAUSED}>
        <Stack gap={6} alignItems="center">
          {unpauseAt ? pauseWithProgress : <Pause color="success" fontSize="large" />}
          <Button
            variant="contained"
            onClick={() => pauseMatch(false)}
            color="success"
            disabled={Boolean(unpauseAt)}
          >
            {buttonText}
          </Button>
        </Stack>
      </Backdrop>

      {match ? (
        <>
          <Box
            sx={(theme) => ({
              height: "100%",
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: isDesktopChat
                ? `${theme.trucoshiUi.chatDrawer.railWidth} minmax(0, 1fr)`
                : "minmax(0, 1fr)",
              gap: 0,
              p: 0,
              boxSizing: "border-box",
            })}
          >
            {isDesktopChat ? <DesktopCommRail chatProps={chatProps} /> : null}
            <Box position="relative" minWidth={0} minHeight={0}>
              <TrucoBoardLayout
                slots={slots}
                layout={boardLayout}
                topContent={
                  <MatchTopBar
                    myTeamIdx={myTeamIdx}
                    myPoints={pointsLabel(match.teams[myTeamIdx === 0 ? 0 : 1].points)}
                    opponentPoints={pointsLabel(match.teams[myTeamIdx === 0 ? 1 : 0].points)}
                    roundLabel={`Ronda ${Math.min(rounds.length + 1, 3)} / 3`}
                    layout={boardLayout}
                    canSay={canSay}
                    pauseRequested={pauseRequested}
                    canAbandon={Boolean(me && !me.abandoned)}
                    onOpenRules={() => setRulesOpen(true)}
                    onTogglePause={() => pauseMatch(true)}
                    onOpenAbandon={() => setAbandonOpen(true)}
                  />
                }
                centerContent={<TrickCenter rounds={rounds} slots={slots} layout={boardLayout} />}
                renderSeat={(slot, index, geometry) => {
                  if (!slot.player) {
                    return (
                      <Box sx={(theme) => theme.trucoshiUi.match.emptySeat}>
                        <Typography color="grey.300" fontSize="0.8rem">
                          Esperando
                        </Typography>
                      </Box>
                    );
                  }

                  const seatPresentation = getMatchSeatPresentationForIndex({
                    layout: boardLayout,
                    seatIndex: index,
                    isMe: Boolean(slot.player.isMe),
                  });

                  return (
                    <Box
                      sx={{
                        transform: `translateY(${seatPresentation.translateY}px)`,
                      }}
                    >
                      <MatchSeatCard
                        player={slot.player}
                        isTurn={Boolean(slot.player.isTurn && !slot.player.disabled && !slot.player.abandoned)}
                        match={match}
                        serverAheadTime={serverAheadTime}
                        seatGeometry={geometry}
                        seatPresentation={seatPresentation}
                      />
                    </Box>
                  );
                }}
                bottomContent={
                  <Box
                    sx={{
                      height: matchDock?.bottomDockReserveHeight || "0px",
                      minHeight: matchDock?.bottomDockReserveHeight || "0px",
                      maxHeight: matchDock?.bottomDockReserveHeight || "0px",
                      pointerEvents: "none",
                    }}
                  />
                }
                boardFooter={
                  <Box position="absolute" visibility="hidden" height={0} width={0}>
                    {debugComponent(match.handState)}
                    {debugComponent(match.players.find((player) => player.isTurn)?.name || null)}
                  </Box>
                }
              />

              <MatchBottomDock
                layout={boardLayout}
                latestAnnouncement={latestAnnouncement}
                previousAnnouncement={previousAnnouncement}
                thirdAnnouncement={thirdAnnouncement}
                latestAnnouncementColor={latestAnnouncementColor}
                previousAnnouncementColor={previousAnnouncementColor}
                thirdAnnouncementColor={thirdAnnouncementColor}
                animateAnnouncement={animateAnnouncement}
                me={me}
                canSay={canSay}
                hasCommandActions={hasCommandActions}
                canInteractWithHand={canInteractWithHand}
                onPlayCard={onPlayCard}
                onSayCommand={sayCommand}
                onOpenChat={
                  !isDesktopChat && useShortPhoneChatDockButton
                    ? () => chatProps.setActive(true)
                    : undefined
                }
                bottomOffsetOverride={compactDockBottomOffset}
              />
            </Box>
          </Box>

          <RulesDialog open={isRulesOpen} onClose={() => setRulesOpen(false)} options={match.options} />

          <AbandonDialog
            open={isAbandonOpen}
            onClose={() => setAbandonOpen(false)}
            onAbandon={() => {
              leaveMatch();
              setAbandonOpen(false);
            }}
          />

          <ConfirmationModal {...confirmation} />
        </>
      ) : (
        <FloatingProgress />
      )}

      {!isDesktopChat ? (
        <CommDrawer
          chatProps={chatProps}
          variant="chatEmotes"
          bottomOffset="calc(env(safe-area-inset-bottom) + 0.28rem)"
          compact={boardLayout.profile === "phoneWide"}
          showLauncher={!useShortPhoneChatDockButton}
        />
      ) : null}

      {stats?.spectators ? (
        <Tooltip
          placement="top"
          title={`${stats.spectators} Espectador${stats.spectators > 1 ? "es" : ""}`}
        >
          <Box sx={spectatorTooltipSx}>
            <Typography color="text.secondary" display="flex" gap={1.5} alignItems="center">
              <Visibility fontSize="small" /> {stats.spectators}
            </Typography>
          </Box>
        </Tooltip>
      ) : null}

      <Toasty animate={chatProps.latestMessage?.sound === "toasty"} />
    </Box>
  );
};

export const Match = memo(_Match);
