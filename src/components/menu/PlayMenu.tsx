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
import { Link, useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { ITrucoshiStats } from "trucoshi";
import { MouseEvent, ReactNode, SyntheticEvent, useEffect, useState } from "react";
import GamepadIcon from "@mui/icons-material/Gamepad";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { MatchQueuePlayerCount, useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";

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
  ...props
}: BoxProps & { eyebrow?: boolean; onMenuClick?: (e: SyntheticEvent) => void }) => {
  const navigate = useNavigate();
  const [{ account, stats, activeMatches, queueReplayOptions, serverAheadTime }] = useTrucoshi();
  const { status, isQueueing, joinQueue, leaveQueue } = useMatchQueue();
  const [maxPlayers, setMaxPlayers] = useState<MatchQueuePlayerCount>(0);
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
  const handlePlayClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (queuedMatch && !isQueueing) {
      onMenuClick?.(event);
      navigate(`/match/${queuedMatch.matchSessionId}`);
      return;
    }

    joinQueue({ maxPlayers, allowBots: playWithBots });
  };
  const playButtonLabel = isQueueing
    ? "Buscando..."
    : queuedMatch
      ? "Volver a partida"
      : queueReplayOptions
        ? "Jugar de nuevo!"
        : "Jugar!";

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
        <Stack gap={1.25} p={2} mb={2}>
          {queuedMatch ? null : (
            <ToggleButtonGroup
              exclusive
              fullWidth
              color="warning"
              disabled={isQueueing}
              value={maxPlayers}
              onChange={(_, value: MatchQueuePlayerCount | null) => {
                if (value !== null) {
                  setMaxPlayers(value);
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
          <Stack direction="row" gap={1} alignItems="center">
            <Button
              fullWidth
              sx={() => ({ px: 2, fontWeight: 800, minHeight: "2.75rem" })}
              color="warning"
              size="large"
              variant="contained"
              disabled={isQueueing}
              startIcon={
                isQueueing ? <CircularProgress color="inherit" size={18} /> : <GamepadIcon />
              }
              onClick={handlePlayClick}
            >
              {playButtonLabel}
            </Button>
            {isQueueing ? (
              <Tooltip title="Cancelar cola">
                <IconButton
                  aria-label="Cancelar cola"
                  color="inherit"
                  onClick={leaveQueue}
                  sx={(theme) => ({
                    ...theme.trucoshiUi.queue.cancelButton,
                    width: "2.75rem",
                    height: "2.75rem",
                    flex: "0 0 auto",
                  })}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
          {queuedMatch ? null : (
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <FormControlLabel
                sx={{ m: 0, minWidth: 0 }}
                control={
                  <Checkbox
                    color="warning"
                    checked={playWithBots}
                    disabled={isQueueing}
                    onChange={(event) => setPlayWithBots(event.target.checked)}
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
                {maxPlayers || "Todo"}
              </Typography>
            </Stack>
          )}
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
          <Button
            sx={() => ({ px: 5, fontWeight: 800, fontSize: "large" })}
            color="warning"
            size="large"
            onClick={onMenuClick}
            component={Link}
            to="/matches"
          >
            Partidas
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
