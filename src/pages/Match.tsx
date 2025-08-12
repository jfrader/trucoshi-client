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
import { useCallback, useEffect, useState, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/game/GameTable";
import { Rounds } from "../components/game/Rounds";
import { IPublicPlayer, EMatchState } from "trucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import {
  FixedChatContainer,
  ChatRoom,
  useChatRoom,
  ChatButton,
  getMessageContent,
} from "../components/chat/ChatRoom";
import { MatchPlayer } from "../components/game/MatchPlayer";
import { MatchPoints } from "../components/game/MatchPoints";
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
import { Pause, Visibility } from "@mui/icons-material";
import { useToast } from "../hooks/useToast";
import CircularProgress from "@mui/material/CircularProgress";

const spectatorTooltipSx = (theme: any) => ({
  position: "fixed",
  right: "1em",
  bottom: "1.3em",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  bgcolor: alpha(theme.palette.background.paper, 0.5),
});

const matchPointsContainerSx = {
  position: "fixed",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  right: 0,
  top: "52px",
  maxWidth: "24em",
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
    <DialogTitle>Atención</DialogTitle>
    <DialogContent>
      <Typography>Estás a punto de abandonar la partida</Typography>
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

const _Match = () => {
  const [{ serverAheadTime }, , , hydrated] = useTrucoshi();
  const [isAbandonOpen, setAbandonOpen] = useState(false);
  const [isRulesOpen, setRulesOpen] = useState(false);
  const [inspecting, inspect] = useState<IPublicPlayer | null>(null);
  const [unpauseAt, setUnpauseAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const isUpXs = useMediaQuery((theme: any) => theme.breakpoints.up("sm"));
  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();
  const navigate = useNavigate();
  const toast = useToast();

  const [
    { match, stats, error, canSay, canPlay, me },
    { playCard, sayCommand, leaveMatch, pauseMatch },
  ] = useMatch(sessionId, {
    onMyTurn: () => queue("turn"),
    onFreshHand: () => queue("round"),
    onPauseRequest(expiresAt, answer) {
      toast.success("El oponente quiere una pausa", {
        preventDuplicate: true,
        autoHideDuration: expiresAt ? expiresAt - (Date.now() + serverAheadTime) : 5000,
        anchorOrigin: { horizontal: "left", vertical: "top" },
        iconVariant: { success: <Pause /> },
        onClose(_event, reason) {
          if (reason !== "instructed") {
            answer(false);
          }
        },
        action: (
          <ButtonGroup size="small" variant="contained" color="success">
            <Button
              onClick={() => {
                answer(true);
              }}
            >
              Pausar
            </Button>
            <Button variant="text" color="error" onClick={() => answer(false)}>
              Rechazar
            </Button>
          </ButtonGroup>
        ),
      });
    },
    onUnpause(unpausesAt) {
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
  const [, , , say] = chatProps.useChatState;

  useEffect(() => {
    if (
      match?.state &&
      (match.state === EMatchState.UNREADY || match.state === EMatchState.READY)
    ) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match?.state, navigate, sessionId]);

  const Slot = useCallback(
    ({ player }: { player: IPublicPlayer }) => (
      <MatchPlayer
        key={player.idx}
        say={say}
        canPlay={canPlay}
        player={player}
        onPlayCard={playCard}
        match={match}
      />
    ),
    [canPlay, match, playCard, say]
  );

  const InnerSlot = useCallback(
    ({ player }: { player: IPublicPlayer }) =>
      match ? (
        <Rounds
          key={player.idx}
          onMouseEnter={() => inspect(player)}
          onMouseLeave={() => inspect(null)}
          player={player}
          match={match}
        />
      ) : null,
    [match]
  );

  const MiddleSlot = useCallback(
    () =>
      match && !match.florBattle && chatProps.latestMessage?.command ? (
        <Box
          width="100%"
          height="100%"
          display="flex"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <ChatButton
            color={getTeamColor(Number(chatProps.latestMessage.user.name))}
            variant="contained"
            sx={{ fontSize: "1rem" }}
            message={chatProps.latestMessage}
          >
            <Stack whiteSpace="nowrap" direction="row" flexWrap="nowrap" gap={1}>
              <span>{getMessageContent(chatProps.latestMessage)}</span>
            </Stack>
          </ChatButton>
        </Box>
      ) : null,
    [chatProps.latestMessage, match]
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
    return <MatchFinishedScreen match={match} chatProps={chatProps} error={error} />;
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
    <Box flexGrow={1} maxWidth="100%" position="relative">
      {match?.me && <CommandBar canSay={canSay} onSayCommand={sayCommand} player={match.me} />}
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
          <GameTable
            zoomOnIndex={me ? 1 : -1}
            zoomOnMiddle
            zoomFactor={isUpXs ? (match.players.length > 4 ? 1.1 : 1.15) : 1.25}
            match={match}
            inspecting={inspecting}
            Slot={Slot}
            InnerSlot={InnerSlot}
            MiddleSlot={MiddleSlot}
            middlePointerEventsDisabled
          />
          <Box sx={matchPointsContainerSx}>
            <Stack direction="row">
              <Button onClick={() => setRulesOpen(true)} color="warning">
                Reglas
              </Button>
              <Button disabled={!canSay} onClick={() => pauseMatch(true)} color="info">
                Pausa
              </Button>
              {me && !me.abandoned && (
                <Button disabled={!canSay} onClick={() => setAbandonOpen(true)} color="error">
                  Rendirse
                </Button>
              )}
            </Stack>
            <Box>
              <MatchPoints match={match} prevHandPoints={match.previousHand?.points} />
              <Box position="absolute">
                {debugComponent(match.handState)}
                {debugComponent(match.players.find((p) => p.isTurn)?.name || null)}
              </Box>
            </Box>
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
        </>
      ) : (
        <FloatingProgress />
      )}
      <FixedChatContainer>
        <ChatRoom {...chatProps} />
      </FixedChatContainer>
      {stats?.spectators && (
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
      )}
      <Toasty animate={chatProps.latestMessage?.sound === "toasty"} />
    </Box>
  );
};

export const Match = memo(_Match);
