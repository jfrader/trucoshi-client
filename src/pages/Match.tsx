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
import { useTurnTimer } from "../trucoshi/hooks/useTurnTimer";
import { EFlorCommand, EMatchState, ICard, IPlayedCard, IPublicPlayer } from "trucoshi";
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
import { UserAvatar } from "../shared/UserAvatar";
import { TrucoBoardLayout, buildAlternatingSlots } from "../components/game/TrucoBoardLayout";
import { BURNT_CARD } from "trucoshi";
import { CommDrawer } from "../components/chat/CommDrawer";

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

const SeatCard = ({
  player,
  isTurn,
  match,
  serverAheadTime,
  seatIndex,
  totalSeats,
}: {
  player: IPublicPlayer;
  isTurn: boolean;
  match: ReturnType<typeof useMatch>[0]["match"];
  serverAheadTime: number;
  seatIndex: number;
  totalSeats: number;
}) => {
  const turnTimer = useTurnTimer(player, serverAheadTime, match);
  const hiddenCards = Math.min(player.hand.length, 3);
  const timerVisible = Boolean(player.isTurn && !player.abandoned && !player.disabled);
  const seatAngle = ((90 + (seatIndex * 360) / Math.max(totalSeats, 2)) * Math.PI) / 180;
  const seatCos = Math.cos(seatAngle);
  const seatSin = Math.sin(seatAngle);
  const sideStrength = Math.abs(seatCos);
  const isLowerLeftSeat = totalSeats === 6 && seatIndex === 1;
  const isLowerRightSeat = totalSeats === 6 && seatIndex === 5;
  const inwardDistance = 24 + sideStrength * 10;
  const arcShift = sideStrength > 0.2 ? 16 + sideStrength * 8 : 0;
  const arcDir = sideStrength > 0.2 ? Math.sign(seatCos) : 0;
  const baseX = -seatCos * inwardDistance + arcDir * arcShift;
  const baseY = -seatSin * inwardDistance - sideStrength * 16;
  const baseRotate = seatCos * 44;
  const seatHandTransform = player.isMe
    ? { x: 0, y: 0, rotate: 0, origin: "center center" }
    : {
        // Radial inward pull + side arc shift places hands between seat anchors.
        x: isLowerLeftSeat ? 80 : isLowerRightSeat ? -76 : baseX,
        y: isLowerLeftSeat || isLowerRightSeat ? -18 : baseY,
        // Bottom side hands: rotate inward around avatar axis.
        rotate: isLowerLeftSeat ? 20 : isLowerRightSeat ? -20 : baseRotate,
        // Anchor rotation near avatar center; name remains a hanging label.
        origin: isLowerLeftSeat || isLowerRightSeat ? "50% -40px" : "50% -80px",
      };

  const ringColor = turnTimer.alert ? "#f6b748" : turnTimer.isExtension ? "#ff6554" : "#44cc7b";
  const statusColor = player.abandoned
    ? "error.main"
    : player.disabled
    ? "warning.main"
    : isTurn
    ? "info.light"
    : `${getTeamColor(player.teamIdx)}.light`;

  const ringAngle = timerVisible ? Math.max(0, Math.min(100, turnTimer.progress)) * 3.6 : 0;

  return (
    <Stack
      alignItems="center"
      spacing={0.42}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { xs: "9rem", sm: "9.4rem" },
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={(theme) => ({
          p: timerVisible ? "2px" : 0,
          borderRadius: "999px",
          transition: theme.transitions.create(["background", "padding"], {
            duration: theme.transitions.duration.shortest,
          }),
          background: timerVisible
            ? `conic-gradient(from -90deg, ${ringColor} ${ringAngle}deg, ${alpha(
                theme.palette.common.white,
                0.12
              )} ${ringAngle}deg 360deg)`
            : "transparent",
        })}
      >
        <Paper
          sx={{
            p: 0.25,
            borderRadius: "999px",
            bgcolor: "rgba(0,0,0,0.28)",
            border: "2px solid rgba(201,126,59,0.95)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          <UserAvatar
            account={player}
            size={player.isMe ? "large" : "big"}
            bgcolor={`${getTeamColor(player.teamIdx)}.main`}
            sx={{
              border: "2px solid rgba(255,255,255,0.12)",
              boxSizing: "border-box",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 1,
              bottom: 1,
              width: "0.76rem",
              height: "0.76rem",
              borderRadius: "50%",
              bgcolor: statusColor,
              border: "2px solid rgba(17,24,20,0.95)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
            }}
          />
        </Paper>
      </Box>

      <Paper
        sx={{
          px: 1.05,
          py: 0.24,
          minWidth: "4.6rem",
          borderRadius: "0.62rem",
          bgcolor: "rgba(11, 19, 16, 0.9)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow: "0 6px 10px rgba(0,0,0,0.24)",
        }}
      >
        <Typography
          color="common.white"
          fontWeight={800}
          lineHeight={1.1}
          textAlign="center"
          fontSize={{ xs: "1rem", sm: "0.94rem" }}
          noWrap
          title={player.name}
          sx={{ textTransform: "capitalize" }}
        >
          {player.name}
        </Typography>
      </Paper>

      {!player.isMe ? (
        <Stack
          direction="row"
          justifyContent="center"
          sx={{
            position: "absolute",
            left: "50%",
            top: "4.7rem",
            width: "7rem",
            minHeight: "3.35rem",
            transform: `translate(calc(-50% + ${seatHandTransform.x}px), ${seatHandTransform.y}px) rotate(${seatHandTransform.rotate}deg)`,
            transformOrigin: seatHandTransform.origin,
          }}
        >
          {Array.from({ length: 3 }).map((_, idx) => {
            const visible = idx < hiddenCards && !player.abandoned;
            return (
              <Box
                key={`${player.key}-${idx}`}
                ml={idx ? -1.42 : 0}
                sx={{
                  transform: `rotate(${(idx - 1) * 5}deg)`,
                  transformOrigin: "bottom center",
                  visibility: visible ? "visible" : "hidden",
                }}
              >
                <GameCard disableButton card={BURNT_CARD} width="clamp(1.82rem, 5.1vw, 2.02rem)" shadow />
              </Box>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
};

const TrickCenter = ({
  rounds,
  slots,
  facePlayerRotation = false,
  spreadBoost = 0,
}: {
  rounds: IPlayedCard[][];
  slots: ReturnType<typeof buildAlternatingSlots<IPublicPlayer>>;
  facePlayerRotation?: boolean;
  spreadBoost?: number;
}) => {
  const CENTER_SHIFT_X = 0;
  const CENTER_SHIFT_Y = 0;
  const PLAYER_SPREAD_X = 42 + spreadBoost;
  const PLAYER_SPREAD_Y = 39 + spreadBoost;
  const getStableRotation = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    const normalized = (((hash % 1000) + 1000) % 1000) / 1000;
    return normalized * 12 - 6;
  };
  const getStableJitter = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 33 + seed.charCodeAt(i)) | 0;
    }
    const xNorm = (((hash % 1000) + 1000) % 1000) / 1000;
    const yNorm = ((((hash / 1000) | 0) % 1000) + 1000) % 1000 / 1000;
    return {
      x: xNorm * 8 - 4,
      y: yNorm * 8 - 4,
    };
  };

  const slotByPlayer = useMemo(
    () =>
      slots.reduce<Record<string, number>>((acc, slot, i) => {
        if (slot.player) {
          acc[slot.player.key] = i;
        }
        return acc;
      }, {}),
    [slots]
  );

  const playOrder = useMemo(() => {
    const orderByCard: Record<string, number> = {};
    let order = 1;

    rounds.forEach((round, roundIdx) => {
      round.forEach((played) => {
        orderByCard[`${roundIdx}-${played.player.key}-${played.card}`] = order;
        order += 1;
      });
    });

    return orderByCard;
  }, [rounds]);

  return (
    <Box width="100%" height="100%" position="relative">
      {slots.flatMap((slot) => {
        if (!slot.player) {
          return [];
        }

        const slotIndex = slotByPlayer[slot.player.key] ?? 0;
        const angleDeg = 90 + (slotIndex * 360) / Math.max(slots.length, 2);
        const angle = (angleDeg * Math.PI) / 180;
        const x = 50 + CENTER_SHIFT_X + Math.cos(angle) * PLAYER_SPREAD_X;
        const y = 50 + CENTER_SHIFT_Y + Math.sin(angle) * PLAYER_SPREAD_Y;

        const playerRoundCards = rounds
          .map((round, roundIdx) => ({
            roundIdx,
            played: round.find((entry) => entry.player.key === slot.player?.key),
          }))
          .filter((entry): entry is { roundIdx: number; played: IPlayedCard } => Boolean(entry.played))
          .slice(0, 3);

        return playerRoundCards.map(({ played, roundIdx }) => {
          const orderKey = `${roundIdx}-${played.player.key}-${played.card}`;
          const zOrder = playOrder[orderKey] || 0;
          const baseRotation = facePlayerRotation ? angleDeg - 90 : 0;
          const rotation = baseRotation + getStableRotation(orderKey);
          const jitter = getStableJitter(orderKey);

          return (
            <Box
              key={`${played.player.key}-${played.card}-${roundIdx}`}
              sx={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(calc(-50% + ${jitter.x}px), calc(-50% + ${jitter.y}px)) rotate(${rotation}deg)`,
                zIndex: 20 + zOrder,
              }}
            >
              <GameCard
                card={played.card}
                width="clamp(4.0rem, 12vw, 4.6rem)"
                shadow
                disableButton
              />
            </Box>
          );
        });
      })}
    </Box>
  );
};

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
  const canInteractWithHand = Boolean(canPlay && me?.isTurn && !me?.disabled && !me?.abandoned);
  const hasCommandActions = Boolean(
    me &&
      canSay &&
      ((me.isEnvidoTurn && (me.envido?.length || 0) > 0) || (me.commands?.length || 0) > 0)
  );
  const handCardWidth = isDesktop
    ? "clamp(3.05rem, 3.2vw, 3.7rem)"
    : "clamp(4.95rem, 13.4dvh, 6.65rem)";

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
        height: { xs: "calc(100dvh - 50px)", md: "calc(100dvh - 102px)" },
        maxHeight: { xs: "calc(100dvh - 50px)", md: "calc(100dvh - 102px)" },
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
            seatRadiusXMultiplier={isDesktop ? 1.1 : isMidViewport ? 1.07 : 1.04}
            seatRadiusYMultiplier={isDesktop ? 1.12 : isMidViewport ? 1.08 : 1.1}
            seatOutwardOffsetX={isDesktop ? 4 : isMidViewport ? 6 : 7}
            seatOutwardOffsetY={isDesktop ? 10 : isMidViewport ? 12 : 14}
            seatSideInset={isDesktop ? 4.5 : isMidViewport ? 5.1 : 5.7}
            seatSideVerticalOffset={isDesktop ? 2.8 : isMidViewport ? 3.2 : 3.6}
            topContent={
              <>
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: "37rem",
                    margin: "0 auto",
                    px: { xs: 0.35, sm: 0.5 },
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "start",
                    gap: { xs: 0.55, sm: 0.75 },
                  }}
                >
                  <Paper sx={{ ...scoreCardSx, justifySelf: "start" }}>
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
                  <Box sx={{ justifySelf: "end", position: "relative" }}>
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
              />
            }
            renderSeat={(slot, index) =>
              slot.player ? (
                <Box
                  sx={{
                    transform: slot.player.isMe
                      ? "translateY(18px)"
                      : slots.length === 6 && (index === 1 || index === 5)
                      ? "translateY(24px)"
                      : "none",
                  }}
                >
                  <SeatCard
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
              <Stack spacing={0.68} pb={{ xs: "4.75rem", sm: "4.35rem", md: "4.1rem" }}>
                <Paper
                  sx={{
                    borderRadius: "0.8rem",
                    py: 0.68,
                    px: 0.95,
                    minHeight: "4.75rem",
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
                    pt: isDesktop ? 0.4 : 0.65,
                    px: isDesktop ? 0.5 : 0.65,
                    pb: 0.45,
                    minHeight: isDesktop ? "5.9rem" : "6.15rem",
                    borderRadius: "0.86rem",
                    background:
                      "linear-gradient(180deg, rgba(112,72,39,0.96) 0%, rgba(70,45,27,0.98) 18%, rgba(45,28,18,0.98) 100%)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow:
                      "0 10px 20px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -5px 12px rgba(0,0,0,0.28)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="flex-end"
                    sx={{
                      minHeight: isDesktop ? "4.7rem" : "5rem",
                      transform: isDesktop ? "translateY(0.1rem)" : "translateY(-0.45rem)",
                    }}
                  >
                    {(() => {
                      const hand = (me?.hand || []).slice(0, 3) as ICard[];
                      const handCount = hand.length;
                      const fanRotations =
                        handCount === 3 ? [-10, 0, 10] : handCount === 2 ? [-7, 7] : [0];

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
                <Box minHeight={isDesktop ? "4rem" : "4.55rem"}>
                  {me && hasCommandActions ? (
                    <CommandBar
                      canSay={canSay}
                      onSayCommand={sayCommand}
                      player={me}
                      compact={isDesktop || isMidViewport}
                    />
                  ) : me ? (
                    <Paper
                      sx={{
                        borderRadius: "0.75rem",
                        py: 0.64,
                        px: 1,
                        textAlign: "center",
                        minHeight: isDesktop ? "4rem" : "4.55rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(33, 23, 16, 0.82)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 6px 14px rgba(0,0,0,0.24)",
                      }}
                    >
                      <Typography fontSize="0.86rem" color="grey.300" fontWeight={600}>
                        Esperando jugada
                      </Typography>
                    </Paper>
                  ) : null}
                </Box>
              </Stack>
            }
            boardFooter={
              <Box position="absolute" visibility="hidden" height={0} width={0}>
                {debugComponent(match.handState)}
                {debugComponent(match.players.find((p) => p.isTurn)?.name || null)}
              </Box>
            }
          />

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
