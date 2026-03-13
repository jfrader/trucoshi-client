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
import { useChatRoom } from "../components/chat/ChatRoom";
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
  MoreHoriz,
  Pause,
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
  bottom: "1.3em",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  bgcolor: alpha(theme.palette.background.paper, 0.5),
});

const scoreCardSx = {
  px: 1.3,
  py: 0.9,
  minWidth: "5.2rem",
  borderRadius: "1rem",
  background: "linear-gradient(170deg, rgba(17, 43, 35, 0.86), rgba(6, 25, 20, 0.86))",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
};

const topBadgeSx = {
  px: 1.6,
  py: 0.8,
  borderRadius: "0.9rem",
  bgcolor: "rgba(12, 24, 19, 0.85)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const emptySeatSx = {
  borderRadius: "0.95rem",
  border: "1px dashed rgba(255,255,255,0.35)",
  bgcolor: "rgba(0,0,0,0.2)",
  p: 1,
  textAlign: "center",
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
}: {
  player: IPublicPlayer;
  isTurn: boolean;
  match: ReturnType<typeof useMatch>[0]["match"];
  serverAheadTime: number;
}) => {
  const turnTimer = useTurnTimer(player, serverAheadTime, match);
  const hiddenCards = Math.min(player.hand.length, 3);
  const timerVisible = Boolean(player.isTurn && !player.abandoned && !player.disabled);

  const ringColor = turnTimer.alert
    ? "warning.main"
    : turnTimer.isExtension
    ? "error.main"
    : "success.main";

  const ringAngle = timerVisible ? Math.max(0, Math.min(100, turnTimer.progress)) * 3.6 : 0;

  return (
    <Box
      sx={(theme) => ({
        p: timerVisible ? "2px" : 0,
        borderRadius: "1rem",
        transition: theme.transitions.create(["background", "padding"], {
          duration: theme.transitions.duration.shortest,
        }),
        background: timerVisible
          ? `conic-gradient(from -90deg, ${theme.palette[ringColor.split(".")[0] as "success" | "warning" | "error"][ringColor.split(".")[1] as "main"]} ${ringAngle}deg, ${alpha(
              theme.palette.common.white,
              0.08
            )} ${ringAngle}deg 360deg)`
          : "transparent",
      })}
    >
      <Paper
        sx={{
          borderRadius: "0.95rem",
          p: 0.8,
          background: "rgba(17, 28, 24, 0.87)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 10px 22px rgba(0,0,0,0.34)",
        }}
      >
        <Stack direction="row" alignItems="center" gap={0.8}>
          <UserAvatar account={player} size="small" bgcolor={`${getTeamColor(player.teamIdx)}.main`} />
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
            <Typography
              fontSize="0.82rem"
              color={player.abandoned ? "error.light" : player.disabled ? "warning.light" : "grey.300"}
            >
              {player.abandoned
                ? "Retirado"
                : player.disabled
                ? "Al mazo"
                : isTurn
                ? "Turno"
                : player.isMe
                ? "Vos"
                : "Esperando"}
            </Typography>
          </Box>
        </Stack>
        {!player.isMe && !player.abandoned ? (
          <Stack direction="row" justifyContent="center" mt={0.7}>
            {Array.from({ length: hiddenCards }).map((_, idx) => (
              <Box key={`${player.key}-${idx}`} ml={idx ? -1.2 : 0}>
                <GameCard disableButton card={BURNT_CARD} width="clamp(2.15rem, 7vw, 2.35rem)" shadow />
              </Box>
            ))}
          </Stack>
        ) : null}
      </Paper>
    </Box>
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
  const CENTER_SHIFT_X = 3;
  const CENTER_SHIFT_Y = 5;
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

  const [rounds] = useRounds(match);
  const slots = useMemo(() => (match ? buildAlternatingSlots(match.players) : []), [match]);
  const myTeamIdx = me?.teamIdx ?? 0;
  const isDesktop = useMediaQuery((theme: any) => theme.breakpoints.up("md"));
  const isMidViewport = useMediaQuery("(min-width:450px) and (max-width:899px)");
  const canInteractWithHand = Boolean(canPlay && me?.isTurn && !me?.disabled && !me?.abandoned);
  const handCardWidth = isDesktop
    ? "clamp(3.05rem, 3.2vw, 3.75rem)"
    : "clamp(4.8rem, 14dvh, 6.6rem)";

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
            seatRadiusXMultiplier={isDesktop ? 1.07 : isMidViewport ? 1.03 : 1}
            seatRadiusYMultiplier={isDesktop ? 1 : isMidViewport ? 0.9 : 1}
            topContent={
              <>
                <Paper sx={scoreCardSx}>
                  <Typography fontSize="0.78rem" color="grey.300">
                    {myTeamIdx === 0 ? "Nosotros" : "Ellos"}
                  </Typography>
                  <Typography fontSize="1.75rem" fontWeight={800} color="warning.light">
                    {pointsLabel(match.teams[myTeamIdx === 0 ? 0 : 1].points)}
                  </Typography>
                </Paper>
                <Paper sx={topBadgeSx}>
                  <Typography color="common.white" fontWeight={700} fontSize="1.1rem">
                    Ronda {Math.min(rounds.length + 1, 3)} / 3
                  </Typography>
                </Paper>
                <Stack direction="row" alignItems="center" spacing={0.6}>
                  <Paper sx={scoreCardSx}>
                    <Typography fontSize="0.78rem" color="grey.300">
                      {myTeamIdx === 0 ? "Ellos" : "Nosotros"}
                    </Typography>
                    <Typography fontSize="1.75rem" fontWeight={800} color="warning.light">
                      {pointsLabel(match.teams[myTeamIdx === 0 ? 1 : 0].points)}
                    </Typography>
                  </Paper>
                  <IconButton
                    sx={{
                      bgcolor: "rgba(16, 27, 22, 0.9)",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                    onClick={(event) => setMenuAnchor(event.currentTarget)}
                  >
                    <MoreHoriz />
                  </IconButton>
                </Stack>
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
            renderSeat={(slot) =>
              slot.player ? (
                <SeatCard
                  player={slot.player}
                  isTurn={Boolean(
                    slot.player.isTurn &&
                      !slot.player.disabled &&
                      !slot.player.abandoned
                  )}
                  match={match}
                  serverAheadTime={serverAheadTime}
                />
              ) : (
                <Box sx={emptySeatSx}>
                  <Typography color="grey.300" fontSize="0.8rem">
                    Esperando
                  </Typography>
                </Box>
              )
            }
            bottomContent={
              <Stack spacing={1} pb={{ xs: "3.7rem", sm: "3.4rem", md: "3.2rem" }}>
                <Paper
                  sx={{
                    p: isDesktop ? 0.6 : 1,
                    borderRadius: "1rem",
                    background: "linear-gradient(150deg, rgba(58,36,24,0.97), rgba(28,20,14,0.97))",
                    border: "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  <Stack direction="row" justifyContent="center" alignItems="flex-end">
                    {me?.hand.map((card, idx) => (
                      <Box key={`${card}-${idx}`} ml={idx ? -1.4 : 0}>
                        <GameCard
                          card={card as ICard}
                          width={handCardWidth}
                          shadow
                          enableHover={canInteractWithHand}
                          onClick={() => canInteractWithHand && onPlayCard(card as ICard, idx)}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
                <Box minHeight={isDesktop ? "4.1rem" : "5.4rem"}>
                  {me ? (
                    <CommandBar
                      canSay={canSay}
                      onSayCommand={sayCommand}
                      player={me}
                      compact={isDesktop || isMidViewport}
                    />
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

      <CommDrawer chatProps={chatProps} />

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
