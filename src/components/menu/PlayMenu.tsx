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
import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { ITrucoshiStats } from "trucoshi";
import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import { useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";

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
  const [{ account, stats }] = useTrucoshi();
  const { status, isQueueing, joinQueue, leaveQueue } = useMatchQueue();
  const [maxPlayers, setMaxPlayers] = useState<2 | 4 | 6>(2);
  const [waitForHumans, setWaitForHumans] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!status?.botFallbackAt) {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [status?.botFallbackAt]);

  const botFallbackRemaining = status?.botFallbackAt
    ? Math.max(Math.ceil((status.botFallbackAt - now) / 1000), 0)
    : null;

  const statusText = status
    ? `${status.queuedPlayers}/${status.requiredPlayers} jugadores`
    : "Entrando a la cola";
  const fallbackText = waitForHumans
    ? "Esperando mesa humana"
    : botFallbackRemaining === null
      ? "Buscando rivales"
      : botFallbackRemaining > 0
        ? `Bots en ${botFallbackRemaining}s`
        : "Preparando bots";

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
      <FormGroup onClick={onMenuClick}>
        <Stack
          gap={1.25}
          sx={(theme) => ({
            ...theme.trucoshiUi.queue.panel,
            p: 1.25,
            mb: 1.5,
          })}
        >
          <ToggleButtonGroup
            exclusive
            fullWidth
            color="warning"
            disabled={isQueueing}
            value={maxPlayers}
            onChange={(_, value: 2 | 4 | 6 | null) => {
              if (value) {
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
            <ToggleButton value={2}>1v1</ToggleButton>
            <ToggleButton value={4}>2v2</ToggleButton>
            <ToggleButton value={6}>3v3</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <FormControlLabel
              sx={{ m: 0, minWidth: 0 }}
              control={
                <Checkbox
                  color="warning"
                  checked={waitForHumans}
                  disabled={isQueueing}
                  onChange={(event) => setWaitForHumans(event.target.checked)}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary" noWrap>
                  Esperar humanos
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
              {maxPlayers}
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <Button
              fullWidth
              sx={() => ({ px: 2, fontWeight: 800, minHeight: "2.75rem" })}
              color="warning"
              size="large"
              variant="contained"
              disabled={isQueueing}
              startIcon={isQueueing ? <CircularProgress color="inherit" size={18} /> : <SearchIcon />}
              onClick={() => joinQueue({ maxPlayers, allowBots: !waitForHumans })}
            >
              {isQueueing ? "Buscando..." : "Buscar partida"}
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
              <Typography variant="body2" color="text.secondary" noWrap>
                {statusText}
              </Typography>
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
            onClick={() => navigate("/matches")}
          >
            Partidas
          </Button>
        </Stack>
        <Button color="primary" size="large" onClick={() => navigate("/ranking")}>
          Ranking
        </Button>
        <Button color="inherit" size="large" onClick={() => navigate("/help")}>
          Ayuda
        </Button>
        {account ? null : (
          <>
            <Button size="large" color="info" onClick={() => navigate("/login")}>
              Iniciar Sesion
            </Button>
          </>
        )}
      </FormGroup>
    </Box>
  );
};
