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
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { EFlorCommand, EMatchState, ICard } from "trucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { getMessageContent, useChatRoom } from "../components/chat/ChatRoom";
import { useSound } from "../sound/hooks/useSound";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { FloatingProgress } from "../shared/FloatingProgress";
import { Backdrop } from "../shared/Backdrop";
import { MatchFinishedScreen } from "../components/game/MatchFinishedScreen";
import { CommandBar } from "../components/game/CommandBar";
import { getTeamColor } from "../utils/team";
import { debugComponent } from "../utils/debugComponent";
import Toasty from "../components/game/Toasty";
import { GameOptionsList } from "../components/game/GameOptionsList";
import {
  Pause,
  Settings,
  VideogameAsset,
  Visibility,
} from "@mui/icons-material";
import { useToast } from "../hooks/useToast";
import CircularProgress from "@mui/material/CircularProgress";
import { GameCard } from "../components/card/GameCard";
import { useConfirmationModal } from "../hooks/useConfirmationModal";
import { ConfirmationModal } from "../shared/ConfirmationModal";
import { TrucoBoardLayout, buildAlternatingSlots } from "../components/game/TrucoBoardLayout";
import { CommDrawer } from "../components/chat/CommDrawer";
import { MatchSeatCard } from "../components/game/MatchSeatCard";
import { TrickCenter } from "../components/game/TrickCenter";
import {
  getMatchBoardLayout,
  getMatchSeatTranslateYPx,
  resolveBoardViewport,
} from "../components/game/boardLayoutPresets";

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

const scoreCardSx = {
  px: { xs: 1.2, sm: 1.35 },
  py: { xs: 0.55, sm: 0.7 },
  minWidth: { xs: "5.2rem", sm: "5.55rem" },
  borderRadius: "0.95rem",
  background: "linear-gradient(170deg, rgba(19, 43, 35, 0.9), rgba(7, 24, 20, 0.92))",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 10px 20px rgba(0,0,0,0.34)",
};

const topBadgeSx = {
  px: { xs: 1.35, sm: 1.6 },
  py: { xs: 0.56, sm: 0.7 },
  borderRadius: "0.8rem",
  bgcolor: "rgba(13, 27, 22, 0.89)",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 8px 18px rgba(0,0,0,0.28)",
};

const emptySeatSx = {
  borderRadius: "999px",
  border: "1px dashed rgba(255,255,255,0.35)",
  bgcolor: "rgba(7,15,12,0.5)",
  px: 1.05,
  py: 0.45,
  textAlign: "center",
  minWidth: "4.2rem",
};

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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();
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
    if (unpauseAt) {
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
    }
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
  const myTeamIdx = me?.teamIdx ?? 0;
  const isDesktop = useMediaQuery((theme: any) => theme.breakpoints.up("md"));
  const isMidViewport = useMediaQuery("(min-width:450px) and (max-width:899px)");
  const isShortViewport = useMediaQuery("(max-height: 760px)");
  const boardViewport = useMemo(
    () => resolveBoardViewport({ isDesktop, isMidViewport }),
    [isDesktop, isMidViewport]
  );
  const matchBoardLayout = useMemo(
    () =>
      getMatchBoardLayout({
        totalSeats: slots.length,
        viewport: boardViewport,
      }),
    [boardViewport, slots.length]
  );
  const canInteractWithHand = Boolean(canPlay && me?.isTurn && !me?.disabled && !me?.abandoned);
  const hasCommandActions = Boolean(
    me &&
      canSay &&
      ((me.isEnvidoTurn && (me.envido?.length || 0) > 0) || (me.commands?.length || 0) > 0)
  );
  const handCardWidth = isDesktop
    ? "clamp(3.05rem, 3.2vw, 3.7rem)"
    : isShortViewport
    ? "clamp(3.3rem, 9.2dvh, 4.5rem)"
    : "clamp(4.9rem, 14.8dvh, 6.95rem)";
  const playedCardWidth = isDesktop
    ? "clamp(2.85rem, 2.4vw, 3.2rem)"
    : isMidViewport
    ? "clamp(3.05rem, 5vw, 3.6rem)"
    : "clamp(4.0rem, 12vw, 4.6rem)";
  const announcementBlockHeight = isShortViewport ? "4rem" : "4.75rem";
  const handBlockHeight = isDesktop ? "5.2rem" : isShortViewport ? "4.45rem" : "6.95rem";
  const commandBlockHeight = isDesktop ? "3.5rem" : isShortViewport ? "3.3rem" : "3.95rem";
  const dockGap = isShortViewport ? "0.38rem" : "0.58rem";
  const dockBottomOffset = "calc(env(safe-area-inset-bottom) + 3.2rem)";
  const bottomDockReserveHeight = isDesktop ? "14.8rem" : isShortViewport ? "12.7rem" : "16.9rem";

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

  useEffect(() => {
    if (
      match?.state &&
      (match.state === EMatchState.UNREADY || match.state === EMatchState.READY)
    ) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match?.state, navigate, sessionId]);

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

  const PauseWithProgress = (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={60}
        thickness={4}
        color="success"
      />
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
      <Backdrop
        hideLogo
        message="Pausa"
        opacity={0.66}
        showChat
        open={match?.state === EMatchState.PAUSED}
      >
        <Stack gap={6} alignItems="center">
          {unpauseAt ? PauseWithProgress : <Pause color="success" fontSize="large" />}
          <Button
            variant="contained"
            onClick={() => pauseMatch(false)}
            color="success"
            disabled={!!unpauseAt}
          >
            {buttonText}
          </Button>
        </Stack>
      </Backdrop>

      {match ? (
        <>
          <TrucoBoardLayout
            slots={slots}
            seatAngleOffsetDeg={matchBoardLayout.seat.seatAngleOffsetDeg}
            seatSideAngleOffsetDeg={matchBoardLayout.seat.seatSideAngleOffsetDeg}
            seatRadiusXMultiplier={matchBoardLayout.seat.seatRadiusXMultiplier}
            seatRadiusYMultiplier={matchBoardLayout.seat.seatRadiusYMultiplier}
            seatSideWeightedYMultiplier={matchBoardLayout.seat.seatSideWeightedYMultiplier}
            seatOutwardOffsetX={matchBoardLayout.seat.seatOutwardOffsetX}
            seatOutwardOffsetY={matchBoardLayout.seat.seatOutwardOffsetY}
            seatSideInset={matchBoardLayout.seat.seatSideInset}
            seatSideVerticalOffset={matchBoardLayout.seat.seatSideVerticalOffset}
            topContent={
              <>
                <Box
                  sx={{
                    width: isDesktop ? "100%" : "auto",
                    maxWidth: isDesktop ? "37rem" : "fit-content",
                    margin: "0 auto",
                    px: isDesktop ? { xs: 0.35, sm: 0.5 } : 0,
                    display: "grid",
                    gridTemplateColumns: isDesktop ? "1fr auto 1fr" : "auto auto auto",
                    alignItems: "start",
                    gap: { xs: 0.55, sm: 0.75 },
                    justifyContent: "center",
                  }}
                >
                  <Paper sx={{ ...scoreCardSx, justifySelf: isDesktop ? "start" : "center" }}>
                    <Typography fontSize={{ xs: "0.82rem", sm: "0.78rem" }} color="grey.300" fontWeight={600}>
                      {myTeamIdx === 0 ? "Nosotros" : "Ellos"}
                    </Typography>
                    <Typography fontSize={{ xs: "2.08rem", sm: "1.82rem" }} lineHeight={1} fontWeight={900} color="warning.light">
                      {pointsLabel(match.teams[myTeamIdx === 0 ? 0 : 1].points)}
                    </Typography>
                  </Paper>
                  <Paper sx={{ ...topBadgeSx, mt: 0.12 }}>
                    <Typography color="common.white" fontWeight={800} fontSize={{ xs: "1.24rem", sm: "1.08rem" }}>
                      Ronda {Math.min(rounds.length + 1, 3)} / 3
                    </Typography>
                  </Paper>
                  <Box sx={{ justifySelf: isDesktop ? "end" : "center", position: "relative" }}>
                    <Paper sx={scoreCardSx}>
                      <Typography fontSize={{ xs: "0.82rem", sm: "0.78rem" }} color="grey.300" fontWeight={600}>
                        {myTeamIdx === 0 ? "Ellos" : "Nosotros"}
                      </Typography>
                      <Typography fontSize={{ xs: "2.08rem", sm: "1.82rem" }} lineHeight={1} fontWeight={900} color="warning.light">
                        {pointsLabel(match.teams[myTeamIdx === 0 ? 1 : 0].points)}
                      </Typography>
                    </Paper>
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: "calc(100% + 0.4rem)",
                        right: 0,
                        bgcolor: "rgba(23, 18, 13, 0.96)",
                        color: "warning.light",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
                      }}
                      onClick={(event) => setMenuAnchor(event.currentTarget)}
                    >
                      <Settings fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Menu
                  open={Boolean(menuAnchor)}
                  anchorEl={menuAnchor}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setRulesOpen(true);
                      setMenuAnchor(null);
                    }}
                  >
                    Reglas
                  </MenuItem>
                  <MenuItem
                    disabled={!canSay || pauseRequested}
                    onClick={() => {
                      pauseMatch(true);
                      setMenuAnchor(null);
                    }}
                  >
                    {pauseRequested ? "Esperando pausa" : "Pausa"}
                  </MenuItem>
                  {me && !me.abandoned ? (
                    <MenuItem
                      onClick={() => {
                        setAbandonOpen(true);
                        setMenuAnchor(null);
                      }}
                    >
                      Rendirse
                    </MenuItem>
                  ) : null}
                </Menu>
              </>
            }
            centerContent={
              <TrickCenter
                rounds={rounds}
                slots={slots}
                facePlayerRotation={false}
                spreadBoost={isDesktop ? 1 : 0}
                playedCardWidth={playedCardWidth}
              />
            }
            renderSeat={(slot, index) =>
              slot.player ? (
                <Box
                  sx={{
                    transform: `translateY(${getMatchSeatTranslateYPx({
                      totalSeats: slots.length,
                      seatIndex: index,
                      isMe: Boolean(slot.player.isMe),
                      layout: matchBoardLayout,
                    })}px)`,
                  }}
                >
                  <MatchSeatCard
                    player={slot.player}
                    isTurn={Boolean(
                      slot.player.isTurn &&
                        !slot.player.disabled &&
                        !slot.player.abandoned
                    )}
                    match={match}
                    serverAheadTime={serverAheadTime}
                    seatIndex={index}
                    totalSeats={slots.length}
                    seatAngleOffsetDeg={matchBoardLayout.seat.seatAngleOffsetDeg}
                    seatSideAngleOffsetDeg={matchBoardLayout.seat.seatSideAngleOffsetDeg}
                  />
                </Box>
              ) : (
                <Box sx={emptySeatSx}>
                  <Typography color="grey.300" fontSize="0.8rem">
                    Esperando
                  </Typography>
                </Box>
              )
            }
            bottomContent={
              <Box
                sx={{
                  height: bottomDockReserveHeight,
                  minHeight: bottomDockReserveHeight,
                  maxHeight: bottomDockReserveHeight,
                  pointerEvents: "none",
                }}
              />
            }
            boardFooter={
              <Box position="absolute" visibility="hidden" height={0} width={0}>
                {debugComponent(match.handState)}
                {debugComponent(match.players.find((p) => p.isTurn)?.name || null)}
              </Box>
            }
          />

          <Box
            sx={(theme) => ({
              position: "absolute",
              left: 0,
              right: 0,
              bottom: dockBottomOffset,
              zIndex: theme.zIndex.drawer + 1,
              px: { xs: 0.35, sm: 0.6 },
              pointerEvents: "auto",
            })}
          >
            <Stack spacing={dockGap}>
              <Paper
                sx={{
                  borderRadius: "0.8rem",
                  py: isShortViewport ? 0.5 : 0.68,
                  px: 0.95,
                  minHeight: announcementBlockHeight,
                  maxHeight: announcementBlockHeight,
                  bgcolor: "rgba(14, 23, 20, 0.88)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 8px 14px rgba(0,0,0,0.28)",
                  animation: animateAnnouncement ? "annAboveCardsPulse 520ms ease-out" : "none",
                  "@keyframes annAboveCardsPulse": {
                    "0%": { transform: "translateY(6px)", opacity: 0.65 },
                    "50%": { transform: "translateY(0)", opacity: 1 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                  },
                }}
              >
                <Typography
                  color={thirdAnnouncementColor}
                  sx={{
                    mt: 0.02,
                    fontSize: { xs: "0.88rem", sm: "0.8rem" },
                    lineHeight: 1.08,
                    textAlign: "center",
                    fontWeight: 600,
                    opacity: thirdAnnouncement ? 0.88 : 0.45,
                    visibility: thirdAnnouncement ? "visible" : "hidden",
                    whiteSpace: "normal",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {thirdAnnouncement ? getMessageContent(thirdAnnouncement) : "Anterior: sin datos"}
                </Typography>
                <Typography
                  color={previousAnnouncementColor}
                  sx={{
                    mt: 0.16,
                    fontSize: { xs: "1rem", sm: "0.9rem" },
                    lineHeight: 1.1,
                    textAlign: "center",
                    fontWeight: 600,
                    opacity: 0.96,
                    whiteSpace: "normal",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {previousAnnouncement ? getMessageContent(previousAnnouncement) : "Anterior: sin datos"}
                </Typography>
                <Typography
                  fontWeight={900}
                  color={latestAnnouncementColor}
                  sx={{
                    mt: 0.2,
                    fontSize: { xs: "1.24rem", sm: "1.08rem" },
                    lineHeight: 1.05,
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    whiteSpace: "normal",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {latestAnnouncement ? getMessageContent(latestAnnouncement) : "Sin anuncios"}
                </Typography>
              </Paper>

              <Paper
                sx={{
                  pt: isDesktop ? 0.32 : 0.48,
                  px: isDesktop ? 0.45 : 0.58,
                  pb: isShortViewport ? 0.26 : 0.38,
                  minHeight: handBlockHeight,
                  maxHeight: handBlockHeight,
                  borderRadius: "0.86rem",
                  background:
                    "linear-gradient(180deg, rgba(112,72,39,0.96) 0%, rgba(70,45,27,0.98) 18%, rgba(45,28,18,0.98) 100%)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 20px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -5px 12px rgba(0,0,0,0.28)",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="flex-end"
                  sx={{
                    minHeight: isDesktop ? "4.1rem" : isShortViewport ? "3.45rem" : "5.8rem",
                    transform: isDesktop
                      ? "translateY(0.08rem)"
                      : isShortViewport
                      ? "translateY(-0.12rem)"
                      : "translateY(0)",
                  }}
                >
                  {(() => {
                    const hand = (me?.hand || []).slice(0, 3) as ICard[];
                    const handCount = hand.length;
                    const fanRotations = handCount === 3 ? [-10, 0, 10] : handCount === 2 ? [-7, 7] : [0];

                    if (!handCount) {
                      return (
                        <Box
                          sx={{
                            width: handCardWidth,
                            height: `calc(${handCardWidth} * 1.48)`,
                            visibility: "hidden",
                            pointerEvents: "none",
                          }}
                        />
                      );
                    }

                    return hand.map((card, idx) => {
                      const rotation = fanRotations[idx] || 0;
                      return (
                        <Box
                          key={`${card}-${idx}`}
                          ml={idx ? -1.32 : 0}
                          sx={{
                            transform: `rotate(${rotation}deg) translateY(${Math.abs(rotation) > 0 ? "2px" : "0"})`,
                            transformOrigin: "bottom center",
                          }}
                        >
                          <GameCard
                            card={card}
                            width={handCardWidth}
                            shadow
                            enableHover={canInteractWithHand}
                            onClick={() => canInteractWithHand && onPlayCard(card, idx)}
                          />
                        </Box>
                      );
                    });
                  })()}
                </Stack>
              </Paper>

              <Box
                sx={{
                  height: commandBlockHeight,
                  minHeight: commandBlockHeight,
                  maxHeight: commandBlockHeight,
                }}
              >
                {me && hasCommandActions ? (
                  <Box sx={{ height: "100%" }}>
                    <CommandBar
                      canSay={canSay}
                      onSayCommand={sayCommand}
                      player={me}
                      compact={isDesktop || isMidViewport || isShortViewport}
                    />
                  </Box>
                ) : me ? (
                  <Paper
                    sx={{
                      borderRadius: "0.75rem",
                      py: 0.52,
                      px: 1,
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(33, 23, 16, 0.82)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "0 6px 14px rgba(0,0,0,0.24)",
                    }}
                  >
                    <Typography fontSize="0.82rem" color="grey.300" fontWeight={600}>
                      Esperando jugada
                    </Typography>
                  </Paper>
                ) : null}
              </Box>
            </Stack>
          </Box>

          <RulesDialog
            open={isRulesOpen}
            onClose={() => setRulesOpen(false)}
            options={match.options}
          />
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

      <CommDrawer
        chatProps={chatProps}
        variant="chatEmotes"
        bottomOffset="calc(env(safe-area-inset-bottom) + 0.28rem)"
        compact={isShortViewport}
      />

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
