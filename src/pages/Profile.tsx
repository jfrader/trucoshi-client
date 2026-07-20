import { Box, Button, CircularProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMe } from "../api/hooks/useMe";
import { PublicMatchHistory } from "../components/profile/PublicMatchHistory";
import { PublicProfileHero } from "../components/profile/PublicProfileHero";
import { usePlayerProfile } from "../components/profile/usePlayerProfile";
import { contentGutterSx } from "../components/layout/contentLayout";
import { PageContainer } from "../shared/PageContainer";
import { NotFound } from "./NotFound";

type PublicProfileTab = "1" | "2";

const ProfileLoading = () => (
  <PageContainer maxWidth="md" title="Perfil">
    <Stack alignItems="center" justifyContent="center" minHeight="18rem" spacing={1.5}>
      <CircularProgress color="warning" size={34} />
      <Typography color="text.secondary" variant="body2">
        Cargando jugador…
      </Typography>
    </Stack>
  </PageContainer>
);

const ProfileError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <PageContainer maxWidth="md" title="Perfil">
    <Stack
      alignItems="center"
      justifyContent="center"
      minHeight="18rem"
      role="alert"
      spacing={1.5}
      textAlign="center"
    >
      <Typography fontWeight={900}>No se pudo cargar el perfil</Typography>
      <Typography color="text.secondary" maxWidth="26rem" variant="body2">
        {message}
      </Typography>
      <Button color="warning" onClick={onRetry} variant="outlined">
        Reintentar
      </Button>
    </Stack>
  </PageContainer>
);

const ProfileDetail = ({ label, value }: { label: string; value: string | number }) => (
  <Stack
    spacing={0.35}
    sx={(theme) => ({
      minWidth: 0,
      px: contentGutterSx,
      py: 1.5,
      borderBottom: `1px solid ${theme.trucoshiUi.content.divider}`,
      "&:last-of-type": { borderBottom: 0 },
    })}
  >
    <Typography
      color="text.secondary"
      fontSize="0.68rem"
      fontWeight={850}
      letterSpacing="0.08em"
      textTransform="uppercase"
    >
      {label}
    </Typography>
    <Typography fontWeight={850}>{value}</Typography>
  </Stack>
);

export const Profile = () => {
  const navigate = useNavigate();
  const { accountId: routeAccountId } = useParams<{ accountId: string }>();
  const [search] = useSearchParams();
  const { me, isPending: isMePending } = useMe();
  const accountId = routeAccountId || (me?.id ? String(me.id) : "");
  const numericAccountId = Number(accountId);
  const isValidAccountId = Number.isInteger(numericAccountId) && numericAccountId > 0;
  const shouldFetchProfile = !isMePending && isValidAccountId;
  const { profile, isLoading, error, retry } = usePlayerProfile(
    shouldFetchProfile ? numericAccountId : undefined,
  );
  const activeTab: PublicProfileTab = search.get("t") === "2" ? "2" : "1";

  useEffect(() => {
    if (isMePending || routeAccountId) {
      return;
    }
    if (!me?.id) {
      navigate("/login", { replace: true });
      return;
    }
    navigate(`/profile/${me.id}`, { replace: true });
  }, [isMePending, me?.id, navigate, routeAccountId]);

  if (isMePending || (!routeAccountId && !me)) {
    return <ProfileLoading />;
  }

  if (!isValidAccountId) {
    return <NotFound />;
  }

  if (error) {
    return <ProfileError message={error} onRetry={retry} />;
  }

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (!profile?.account) {
    return <NotFound />;
  }

  const win = profile.stats?.win || 0;
  const loss = profile.stats?.loss || 0;
  const total = win + loss;
  const winRate = total ? Math.round((win / total) * 100) : 0;

  const handleTabChange = (_event: unknown, value: string) => {
    const nextTab: PublicProfileTab = value === "2" ? "2" : "1";
    navigate(`/profile/${accountId}?t=${nextTab}`, { replace: true });
  };

  const openMatch = (matchId: number) => {
    navigate(`/history/${matchId}`);
  };

  return (
    <PageContainer maxWidth="md">
      <Stack spacing={2.25} pb={2}>
        <PublicProfileHero account={profile.account} win={win} loss={loss} />

        <Stack
          sx={(theme) => ({
            ...theme.trucoshiUi.account.panel,
            overflow: "hidden",
            background: theme.trucoshiUi.content.surface,
          })}
        >
          <Tabs
            value={activeTab}
            variant="fullWidth"
            textColor="inherit"
            onChange={handleTabChange}
            aria-label="Secciones del perfil"
            sx={(theme) => ({
              minHeight: 48,
              borderBottom: `1px solid ${theme.trucoshiUi.content.divider}`,
              background: theme.trucoshiUi.content.navigationSurface,
              "& .MuiTabs-indicator": { backgroundColor: theme.palette.warning.main },
              "& .MuiTab-root": { minHeight: 48, fontWeight: 900 },
              "& .Mui-selected": { color: theme.palette.warning.light },
            })}
          >
            <Tab
              aria-controls="public-profile-panel-1"
              id="public-profile-tab-1"
              label="Información"
              value="1"
            />
            <Tab
              aria-controls="public-profile-panel-2"
              id="public-profile-tab-2"
              label="Historial"
              value="2"
            />
          </Tabs>

          {activeTab === "1" ? (
            <Box aria-labelledby="public-profile-tab-1" id="public-profile-panel-1" role="tabpanel">
              <Stack px={contentGutterSx} pt={contentGutterSx} pb={1.4}>
                <Typography component="h2" variant="h6" fontWeight={950}>
                  Resumen del jugador
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Resultados públicos de sus partidas completadas.
                </Typography>
              </Stack>
              <ProfileDetail label="Jugador" value={profile.account.name} />
              <ProfileDetail label="Partidas" value={total} />
              <ProfileDetail label="Victorias" value={win} />
              <ProfileDetail label="Derrotas" value={loss} />
              <ProfileDetail label="Efectividad" value={`${winRate}%`} />
            </Box>
          ) : (
            <Box aria-labelledby="public-profile-tab-2" id="public-profile-panel-2" role="tabpanel">
              <PublicMatchHistory
                accountId={numericAccountId}
                matches={profile.matches}
                viewerAccountId={me?.id}
                onOpenMatch={openMatch}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </PageContainer>
  );
};
