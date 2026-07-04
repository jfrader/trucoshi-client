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
} from "@mui/material";
import { Link, useMatch, useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { ITrucoshiStats } from "trucoshi";
import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { MatchQueuePlayerCount, useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";
import { NoticeBannerSlot } from "../notice/NoticeBannerSlot";
import { PlayButton } from "./PlayButton";
import { KeyboardBackspace } from "@mui/icons-material";

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
  const isInMatch = useMatch("/match/:id");
  const isInHome = useMatch("/");
  const navigate = useNavigate();
  const [
    { account, stats, activeMatches, queueReplayOptions, serverAheadTime },
    { setSidebarOpen },
  ] = useTrucoshi();
  const { status, isQueueing, joinQueue, leaveQueue } = useMatchQueue();
  const [maxPlayerCount, setMaxPlayers] = useState<MatchQueuePlayerCount>(0);
  const [playWithBots, setPlayWithBots] = useState(false);
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
        <Stack gap={1.25} p={2} mb={1}>
          {queuedMatch ? null : (
            <ToggleButtonGroup
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
              sx={(theme) => ({
                gap: 0.75,
                "& .MuiToggleButtonGroup-grouped": {
                  ...theme.trucoshiUi.queue.segment,
                  borderRadius: "0.55rem !important",
                  minHeight: "2.5rem",
                  fontWeight: 800,
                },
                "& .Mui-selected, & .Mui-selected:hover": theme.trucoshiUi.queue.activeSegment,
              })}
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
            </ToggleButtonGroup>
          )}

          {queuedMatch ? null : (
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <FormControlLabel
                sx={{ m: 0, minWidth: 0 }}
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
                <CircularProgress
                  color="inherit"
                  size="2.75rem"
                  sx={{ mr: 1, position: "absolute" }}
                />
                <IconButton
                  aria-label="Cancelar cola"
                  color="inherit"
                  onClick={leaveQueue}
                  sx={(theme) => ({
                    ...theme.trucoshiUi.queue.cancelButton,
                    width: "2.75rem",
                    height: "2.75rem",
                  })}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Tooltip>
          </Stack>
          {showNoticeBanner ? <NoticeBannerSlot dismissible={false} ignoreDismissal /> : null}
          {isQueueing ? (
            <Stack
              direction="row"
              justifyContent="space-between"
              gap={1}
              sx={(theme) => ({
                ...theme.trucoshiUi.queue.statusPanel,
                px: 1,
                py: 0.75,
              })}
            >
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
            </Stack>
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
