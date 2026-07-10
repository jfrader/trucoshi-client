import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings,
  ContentCopy,
  OpenInNew,
  Redeem,
  Refresh,
  Save,
} from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import { EClientEvent, IAdminDashboard, NoticeBannerSeverity } from "trucoshi";
import { PageContainer } from "../shared/PageContainer";
import { useToast } from "../hooks/useToast";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

const emptyDashboard: IAdminDashboard = {
  onlineAccounts: [],
  liveGames: [],
  rewardCodes: [],
  noticeBanner: null,
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
};

export const Admin = () => {
  const [{ account, isConnected }, , socket] = useTrucoshi();
  const { error: showError, success: showSuccess } = useToast();
  const [dashboard, setDashboard] = useState<IAdminDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [note, setNote] = useState("");
  const [createdLink, setCreatedLink] = useState("");
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeActive, setNoticeActive] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const [noticeSeverity, setNoticeSeverity] = useState<NoticeBannerSeverity>("info");
  const [noticeButtonText, setNoticeButtonText] = useState("");
  const [noticeButtonHref, setNoticeButtonHref] = useState("");

  const isAdmin = account?.role === "ADMIN";

  const fetchDashboard = useCallback(() => {
    if (!isAdmin || !isConnected) {
      return;
    }

    setLoading(true);
    socket.emit(EClientEvent.ADMIN_FETCH_DASHBOARD, ({ success, dashboard, error }) => {
      setLoading(false);

      if (success) {
        setDashboard(dashboard);
        return;
      }

      if (error) {
        showError(error.message);
      }
    });
  }, [isAdmin, isConnected, showError, socket]);

  useEffect(() => {
    fetchDashboard();
  }, [account?.id, fetchDashboard]);

  useEffect(() => {
    const noticeBanner = dashboard.noticeBanner;
    setNoticeActive(Boolean(noticeBanner?.active));
    setNoticeText(noticeBanner?.text || "");
    setNoticeSeverity(noticeBanner?.severity || "info");
    setNoticeButtonText(noticeBanner?.buttonText || "");
    setNoticeButtonHref(noticeBanner?.buttonHref || "");
  }, [dashboard.noticeBanner]);

  const createRewardCode = () => {
    if (!isAdmin || !isConnected || creating) {
      return;
    }

    setCreating(true);
    socket.emit(
      EClientEvent.ADMIN_CREATE_CHEST_REWARD_CODE,
      { note: note.trim() || null },
      ({ success, link, rewardCode, error }) => {
        setCreating(false);

        if (success) {
          setCreatedLink(link);
          setNote("");
          setDashboard((current) => ({
            ...current,
            rewardCodes: [
              rewardCode,
              ...current.rewardCodes.filter((row) => row.id !== rewardCode.id),
            ],
          }));
          showSuccess("Codigo creado");
          return;
        }

        if (error) {
          showError(error.message);
        }
      },
    );
  };

  const copyCreatedLink = () => {
    if (!createdLink || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(createdLink).then(() => {
      showSuccess("Link copiado");
    });
  };

  const saveNoticeBanner = (active = noticeActive) => {
    if (!isAdmin || !isConnected || noticeSaving) {
      return;
    }

    setNoticeSaving(true);
    socket.emit(
      EClientEvent.ADMIN_SET_NOTICE_BANNER,
      {
        active,
        text: noticeText.trim(),
        severity: noticeSeverity,
        buttonText: noticeButtonText.trim() || null,
        buttonHref: noticeButtonHref.trim() || null,
      },
      ({ success, noticeBanner, error }) => {
        setNoticeSaving(false);

        if (success) {
          setDashboard((current) => ({ ...current, noticeBanner }));
          showSuccess(active ? "Aviso actualizado" : "Aviso oculto");
          return;
        }

        if (error) {
          showError(error.message);
        }
      },
    );
  };

  if (!isAdmin) {
    return (
      <PageContainer title="Admin" icon={<AdminPanelSettings color="warning" />}>
        <Alert severity="warning">No disponible para esta cuenta.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="lg"
      title="Admin"
      icon={<AdminPanelSettings color="warning" />}
      action={
        <Button
          color="warning"
          disabled={loading || !isConnected}
          onClick={fetchDashboard}
          size="small"
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <Refresh />}
          variant="outlined"
        >
          Actualizar
        </Button>
      }
    >
      <Stack gap={3}>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 1 }}>
          <Stack gap={2}>
            <Stack direction={{ xs: "column", md: "row" }} gap={1.5} alignItems="stretch">
              <TextField
                fullWidth
                label="Nota"
                onChange={(event) => setNote(event.target.value)}
                size="small"
                value={note}
              />
              <Button
                color="warning"
                disabled={creating || !isConnected}
                onClick={createRewardCode}
                startIcon={creating ? <CircularProgress color="inherit" size={16} /> : <Redeem />}
                variant="contained"
                sx={{ minWidth: { xs: "100%", md: "12rem" } }}
              >
                Crear cofre
              </Button>
            </Stack>
            {createdLink ? (
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                gap={1}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    overflowWrap: "anywhere",
                    fontFamily: "monospace",
                  }}
                >
                  {createdLink}
                </Typography>
                <Button onClick={copyCreatedLink} startIcon={<ContentCopy />} variant="outlined">
                  Copiar
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 1 }}>
          <Stack gap={2}>
            <Typography fontWeight={900} textTransform="uppercase" variant="subtitle2">
              Notice banner
            </Typography>
            <TextField
              fullWidth
              inputProps={{ maxLength: 240 }}
              label="Texto"
              multiline
              minRows={2}
              onChange={(event) => setNoticeText(event.target.value)}
              size="small"
              value={noticeText}
            />
            <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="notice-severity-label">Severidad</InputLabel>
                <Select
                  label="Severidad"
                  labelId="notice-severity-label"
                  onChange={(event) =>
                    setNoticeSeverity(event.target.value as NoticeBannerSeverity)
                  }
                  value={noticeSeverity}
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                inputProps={{ maxLength: 48 }}
                label="Texto boton"
                onChange={(event) => setNoticeButtonText(event.target.value)}
                size="small"
                value={noticeButtonText}
              />
              <TextField
                fullWidth
                label="Link boton"
                onChange={(event) => setNoticeButtonHref(event.target.value)}
                size="small"
                value={noticeButtonHref}
              />
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={noticeActive}
                    color="warning"
                    onChange={(event) => setNoticeActive(event.target.checked)}
                  />
                }
                label={noticeActive ? "Activo" : "Inactivo"}
                sx={{ m: 0 }}
              />
              <Button
                color="warning"
                disabled={noticeSaving || !isConnected}
                onClick={() => saveNoticeBanner(true)}
                startIcon={noticeSaving ? <CircularProgress color="inherit" size={16} /> : <Save />}
                variant="contained"
              >
                Guardar y activar
              </Button>
              <Button
                color="inherit"
                disabled={noticeSaving || !isConnected}
                onClick={() => saveNoticeBanner(false)}
                variant="outlined"
              >
                Ocultar aviso
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", lg: "row" }} gap={3} alignItems="start">
          <Box flex={1} width="100%">
            <SectionTitle title="Cuentas online" value={dashboard.onlineAccounts.length} />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cuenta</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.onlineAccounts.length ? (
                    dashboard.onlineAccounts.map((player) => (
                      <TableRow key={player.accountId} hover>
                        <TableCell>
                          <Typography fontWeight={700}>{player.name}</Typography>
                          <Typography color="text.secondary" variant="caption">
                            #{player.accountId}
                          </Typography>
                        </TableCell>
                        <TableCell>{player.role || "USER"}</TableCell>
                        <TableCell>
                          <Chip color="success" label="Online" size="small" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyRow colSpan={3} label="Sin cuentas conectadas" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box flex={1} width="100%">
            <SectionTitle title="Partidas live" value={dashboard.liveGames.length} />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mesa</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Jugadores</TableCell>
                    <TableCell align="right">Abrir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.liveGames.length ? (
                    dashboard.liveGames.map((match) => (
                      <TableRow key={match.matchSessionId} hover>
                        <TableCell>
                          <Typography fontWeight={700}>{match.ownerId}</Typography>
                          <Typography color="text.secondary" variant="caption">
                            {match.matchSessionId}
                          </Typography>
                        </TableCell>
                        <TableCell>{match.state}</TableCell>
                        <TableCell>
                          {match.players}/{match.options.maxPlayers}
                        </TableCell>
                        <TableCell align="right">
                          <RouterLink
                            to="/match/$sessionId"
                            params={{ sessionId: match.matchSessionId }}
                          >
                            <Button component="span" size="small" startIcon={<OpenInNew />}>
                              Ver
                            </Button>
                          </RouterLink>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyRow colSpan={4} label="Sin partidas activas" />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>

        <Box width="100%">
          <SectionTitle title="Codigos recientes" value={dashboard.rewardCodes.length} />
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Codigo</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell>Redimido</TableCell>
                  <TableCell>Nota</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboard.rewardCodes.length ? (
                  dashboard.rewardCodes.map((rewardCode) => (
                    <TableRow key={rewardCode.id} hover>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {rewardCode.codePreview}
                      </TableCell>
                      <TableCell>{formatDateTime(rewardCode.createdAt)}</TableCell>
                      <TableCell>
                        {rewardCode.redeemedAt ? (
                          <Stack gap={0.5}>
                            <span>{formatDateTime(rewardCode.redeemedAt)}</span>
                            <Typography color="text.secondary" variant="caption">
                              #{rewardCode.redeemedByAccountId}
                            </Typography>
                          </Stack>
                        ) : (
                          <Chip label="Pendiente" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{rewardCode.note || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRow colSpan={4} label="Sin codigos creados" />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </PageContainer>
  );
};

const SectionTitle = ({ title, value }: { title: string; value: number }) => (
  <Stack direction="row" alignItems="center" gap={1} pb={1}>
    <Typography fontWeight={900} textTransform="uppercase" variant="subtitle2">
      {title}
    </Typography>
    <Divider flexItem orientation="vertical" />
    <Chip label={value} size="small" />
  </Stack>
);

const EmptyRow = ({ colSpan, label }: { colSpan: number; label: string }) => (
  <TableRow>
    <TableCell colSpan={colSpan}>
      <Typography color="text.secondary" py={2} textAlign="center" variant="body2">
        {label}
      </Typography>
    </TableCell>
  </TableRow>
);
