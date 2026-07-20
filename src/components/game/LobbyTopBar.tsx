import { ContentCopy, HelpOutlineRounded, Settings } from "@mui/icons-material";
import { Box, IconButton, Paper, Stack, Tooltip, Typography, styled } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type LobbyTopBarProps = {
  maxPlayers: number;
  playerCount: number;
  sessionId?: string;
  settingsDisabled: boolean;
  onCopyLobbyUrl: () => void;
  onOpenOptions: () => void;
};

const LobbyTopBarFrame = styled(Box)(({ theme }) => ({
  width: theme.trucoshiUi.navigation.gameTopBarWidth,
  maxWidth: "40rem",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns: "auto auto minmax(0, max-content) auto",
  alignItems: "start",
  justifyContent: "center",
  gap: theme.spacing(0.35),
  marginInline: "auto",
  [theme.breakpoints.up("sm")]: { gap: theme.spacing(0.75) },
}));

const LobbyBannerText = styled(Typography)(({ theme }) => ({
  minWidth: 0,
  color: theme.palette.common.white,
  fontSize: "0.86rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
  [theme.breakpoints.up("sm")]: { fontSize: "1rem" },
}));

export const LobbyTopBar = ({
  maxPlayers,
  playerCount,
  sessionId,
  settingsDisabled,
  onCopyLobbyUrl,
  onOpenOptions,
}: LobbyTopBarProps) => (
  <LobbyTopBarFrame>
    <Tooltip title="Ayuda y reglas">
      <IconButton
        aria-label="Ayuda y reglas"
        component={RouterLink}
        to="/help"
        sx={(theme) => theme.trucoshiUi.lobby.topSettingsButton}
      >
        <HelpOutlineRounded />
      </IconButton>
    </Tooltip>

    <Paper sx={(theme) => ({ ...theme.trucoshiUi.lobby.topPlayersCard, whiteSpace: "nowrap" })}>
      <LobbyBannerText>
        Lobby {playerCount}/{maxPlayers}
      </LobbyBannerText>
    </Paper>

    <Paper
      sx={(theme) => ({
        ...theme.trucoshiUi.lobby.topSessionCard,
        width: "fit-content",
        maxWidth: "100%",
        minWidth: 0,
        justifySelf: "center",
        overflow: "hidden",
        px: { xs: 0.8, sm: 1.6 },
      })}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} minWidth={0}>
        <LobbyBannerText noWrap title={sessionId}>
          {sessionId}
        </LobbyBannerText>
        <Tooltip title="Copiar link de sala">
          <IconButton
            aria-label="Copiar link de sala"
            color="inherit"
            onClick={onCopyLobbyUrl}
            size="small"
            sx={{ color: "common.white", p: 0.25, flexShrink: 0 }}
          >
            <ContentCopy sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>

    <IconButton
      aria-label="Configurar sala"
      sx={(theme) => theme.trucoshiUi.lobby.topSettingsButton}
      onClick={onOpenOptions}
      disabled={settingsDisabled}
    >
      <Settings />
    </IconButton>
  </LobbyTopBarFrame>
);
