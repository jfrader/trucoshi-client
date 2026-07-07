import {
  Box,
  BoxProps,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { Link, useMatch as useRouteMatch, useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { ITrucoshiStats } from "trucoshi";
import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { MatchQueuePlayerCount, useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";
import { NoticeBannerSlot } from "../notice/NoticeBannerSlot";
import { PlayButton } from "./PlayButton";
import { KeyboardBackspace } from "@mui/icons-material";
import { useMatch as useTrucoshiMatch } from "../../trucoshi/hooks/useMatch";

const QueueModeToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  ...theme.trucoshiUi.queue.segmentGroup,
  "& .MuiToggleButtonGroup-grouped": theme.trucoshiUi.queue.segment,
  "& .Mui-selected, & .Mui-selected:hover": theme.trucoshiUi.queue.activeSegment,
}));

const QueueCancelButton = styled(IconButton)(({ theme }) => theme.trucoshiUi.queue.cancelButton);

const QueueCancelProgress = styled(CircularProgress)(
  ({ theme }) => theme.trucoshiUi.queue.cancelProgress,
);

const QueueStatusPanel = styled(Stack)(({ theme }) => theme.trucoshiUi.queue.statusPanel);

const QueueOptionLabel = styled(FormControlLabel)(({ theme }) => theme.trucoshiUi.queue.optionLabel);

const formatElapsedTime = (milliseconds: number) => {
  const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const OnlinePlayers = ({ stats, label }: { stats: ITrucoshiStats; label?: ReactNode }) => {
  if (!stats.onlinePlayers.length) {
    return null;
  }

  return (
    <Box textTransform="uppercase">
      <Typography color="text.disabled" pr={1} component="span" variant="inherit">
        {label || "Online"}
      </Typography>
      <Typography color="success" component="span" fontSize="inherit" variant="inherit">
        {stats.onlinePlayers.length}
      </Typography>
    </Box>
  );
};

export const PlayMenu = ({
  onMenuClick,
  eyebrow,
  smallPlayButton,
  showNoticeBanner,
  ...props
}: BoxProps & {
  eyebrow?: boolean;
  showNoticeBanner?: boolean;
  smallPlayButton?: boolean;
  onMenuClick?: (e: SyntheticEvent) => void;
}) => {
  const isInMatch = useRouteMatch("/match/:id");
  const isInHome = useRouteMatch("/");
  const navigate = useNavigate();
  const [
    { account, stats, activeMatches, queueReplayOptions, serverAheadTime },
    { setSidebarOpen },
  ] = useTrucoshi();
  const {
    status,
    isQueueing,
    joinQueue,
    leaveQueue,
  } = useMatchQueue();
  const [, { createTutorialMatch }] = useTrucoshiMatch();
  const [maxPlayerCount, setMaxPlayers] = useState<MatchQueuePlayerCount>(0);
  const [playWithBots, setPlayWithBots] = useState(false);
  const [isTutorialLoading, setTutorialLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const queuedMatch = activeMatches.find((match) => match.createdFromQueue);

  useEffect(() => {
    if (!isQueueing) {
      return;
    }

    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [isQueueing]);

  useEffect(() => {
    if (!queueReplayOptions) {
      return;
    }

    setMaxPlayers(queueReplayOptions.maxPlayers);
    setPlayWithBots(queueReplayOptions.allowBots);
  }, [queueReplayOptions]);

  const serverNow = now + serverAheadTime;
  const botFallbackRemaining = status?.botFallbackAt
    ? Math.max(Math.ceil((status.botFallbackAt - serverNow) / 1000), 0)
    : null;
  const elapsedText = status?.queuedAt
    ? `Espera ${formatElapsedTime(serverNow - status.queuedAt)}`
    : null;

  const statusMaxPlayers = status?.maxPlayers as MatchQueuePlayerCount | undefined;
  const statusText = status
    ? statusMaxPlayers === 0
      ? `${status.queuedPlayers} en cola`
      : `${status.queuedPlayers}/${status.requiredPlayers} jugadores`
    : "Entrando a la cola";
  const fallbackText = playWithBots
    ? botFallbackRemaining === null
      ? "Buscando rivales"
      : botFallbackRemaining > 0
        ? `Bots en ${botFallbackRemaining}s`
        : "Preparando bots"
    : "Buscando rivales";

  const handlePlay = ({
    maxPlayers,
    allowBots,
  }: {
    maxPlayers: MatchQueuePlayerCount;
    allowBots: boolean;
  }) => {
    if (queuedMatch && !isQueueing) {
      navigate(`/match/${queuedMatch.matchSessionId}`);
      return;
    }

    if (isInMatch) {
      navigate("/");
    }

    if (isInMatch || isInHome) {
      setSidebarOpen(false);
    }

    joinQueue({ maxPlayers, allowBots });
  };

  const handlePlayClick = (event: SyntheticEvent) => {
    if (queuedMatch && !isQueueing) {
      onMenuClick?.(event);
    }

    handlePlay({ maxPlayers: maxPlayerCount, allowBots: playWithBots });
  };

  const handleTutorialClick = (event: SyntheticEvent) => {
    onMenuClick?.(event);
    setTutorialLoading(true);
    createTutorialMatch((error, match) => {
      setTutorialLoading(false);
      if (error || !match) {
        return;
      }
      navigate(`/match/${match.matchSessionId}`);
    });
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" {...props}>
      {eyebrow ? (
        <Stack direction="row" justifyContent="space-between">
          <Typography
            textAlign="left"
            color="text.disabled"
            textTransform="uppercase"
            variant="subtitle1"
          >
            Jugar
          </Typography>
          <OnlinePlayers stats={stats} />
        </Stack>
      ) : null}
      <FormGroup>
        <Stack gap={1.25} p={2} mb={1} maxWidth="100%">
          {queuedMatch ? null : (
            <QueueModeToggleGroup
              exclusive
              fullWidth
              color="warning"
              value={maxPlayerCount}
              onChange={(_, value: MatchQueuePlayerCount | null) => {
                if (value !== null) {
                  setMaxPlayers(value);

                  if (isQueueing) {
                    leaveQueue();
                    requestAnimationFrame(() => {
                      handlePlay({
                        maxPlayers: value,
                        allowBots: playWithBots,
                      });
                    });
                  }
                }
              }}
            >
              <ToggleButton size="small" value={0}>
                Todo
              </ToggleButton>
              <ToggleButton size="small" value={2}>
                1v1
              </ToggleButton>
              <ToggleButton size="small" value={4}>
                2v2
              </ToggleButton>
              <ToggleButton size="small" value={6}>
                3v3
              </ToggleButton>
            </QueueModeToggleGroup>
          )}

          {queuedMatch ? null : (
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <QueueOptionLabel
                control={
                  <Checkbox
                    color="warning"
                    checked={playWithBots}
                    onChange={(event) => {
                      setPlayWithBots(event.target.checked);

                      if (isQueueing) {
                        leaveQueue();
                        requestAnimationFrame(() => {
                          handlePlay({
                            maxPlayers: maxPlayerCount,
                            allowBots: event.target.checked,
                          });
                        });
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Completar con Bots
                  </Typography>
                }
              />
              <Typography
                display="flex"
                alignItems="center"
                gap={0.5}
                variant="caption"
                color="text.disabled"
                textTransform="uppercase"
                noWrap
              >
                <GroupsIcon fontSize="inherit" />
                {maxPlayerCount || "Todo"}
              </Typography>
            </Stack>
          )}
          <Stack
            flexWrap="wrap"
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="center"
          >
            {queuedMatch ? (
              <Button
                startIcon={<KeyboardBackspace />}
                size="large"
                onClick={handlePlayClick}
                variant="contained"
                color="warning"
              >
                Volver a la partida
              </Button>
            ) : (
              <PlayButton
                maxHeight={smallPlayButton ? "78px" : undefined}
                onClick={handlePlayClick}
                disabled={isQueueing}
              />
            )}
            <Tooltip title="Cancelar cola">
              <Box position="absolute" visibility={isQueueing ? "visible" : "hidden"}>
                <QueueCancelProgress color="inherit" size="2.75rem" />
                <QueueCancelButton
                  aria-label="Cancelar cola"
                  color="inherit"
                  onClick={leaveQueue}
                >
                  <CloseIcon />
                </QueueCancelButton>
              </Box>
            </Tooltip>
          </Stack>
          {showNoticeBanner ? <NoticeBannerSlot dismissible={false} ignoreDismissal /> : null}
          {isQueueing ? (
            <QueueStatusPanel direction="row" justifyContent="space-between" gap={1}>
              <Stack direction="row" gap={1} minWidth={0}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {statusText}
                </Typography>
                {elapsedText ? (
                  <Typography variant="body2" color="text.disabled" noWrap>
                    {elapsedText}
                  </Typography>
                ) : null}
              </Stack>
              <Typography variant="body2" color="warning.light" noWrap>
                {fallbackText}
              </Typography>
            </QueueStatusPanel>
          ) : null}
        </Stack>
        <Stack direction="row" justifyContent="center">
          <Button color="warning" size="large" onClick={onMenuClick} component={Link} to="/matches">
            Crear / Buscar partida
          </Button>
        </Stack>
        <Button color="primary" size="large" onClick={onMenuClick} component={Link} to="/ranking">
          Ranking
        </Button>
        <Button color="inherit" size="large" onClick={onMenuClick} component={Link} to="/help">
          Ayuda
        </Button>
        <Button
          color="warning"
          size="large"
          disabled={isTutorialLoading}
          onClick={handleTutorialClick}
        >
          Aprende a jugar
        </Button>
        {account ? null : (
          <>
            <Button size="large" color="info" onClick={onMenuClick} component={Link} to="/login">
              Iniciar Sesion
            </Button>
          </>
        )}
      </FormGroup>
    </Box>
  );
};
