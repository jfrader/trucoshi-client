import { GroupsOutlined, ManageSearch, RefreshRounded } from "@mui/icons-material";
import {
  alpha,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { EClientEvent, EServerEvent, type IPublicMatchInfo } from "trucoshi";
import { PublicMatchesList } from "../components/community/PublicMatchesList";
import {
  CommunityHero,
  CommunityHeroIcon,
  CommunityHeroMeta,
  CommunityPageRoot,
  CommunitySurface,
  CommunitySurfaceHeader,
} from "../components/community/communityUi";
import { CONTENT_GUTTER } from "../components/layout/contentLayout";
import { CreateMatchButton } from "../components/menu/CreateMatchButton";
import { AdmissionNotice } from "../components/notice/AdmissionNotice";
import { PageContainer } from "../shared/PageContainer";
import { useGameAdmission } from "../trucoshi/hooks/useGameAdmission";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

const RefreshButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: "0.9rem",
  color: theme.palette.warning.light,
  backgroundColor: alpha(theme.palette.text.primary, 0.07),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.12),
  },
}));

const MatchesFooter = styled(Stack)(({ theme }) => ({
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.75, CONTENT_GUTTER.mobile),
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  backgroundColor: alpha(theme.palette.text.primary, 0.025),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    paddingInline: theme.spacing(CONTENT_GUTTER.desktop),
    "& .MuiButton-root": { minWidth: "11rem" },
  },
}));

export const SearchMatches = () => {
  const [{ isConnected, stats }, , socket] = useTrucoshi();
  const { isDraining } = useGameAdmission();

  const [publicMatches, setPublicMatches] = useState<IPublicMatchInfo[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    socket.emit(EClientEvent.JOIN_ROOM, "searching");

    socket.on(EServerEvent.UPDATE_PUBLIC_MATCHES, (matches) => {
      setPublicMatches(matches);
    });

    return () => {
      socket.emit(EClientEvent.LEAVE_ROOM, "searching");
      socket.off(EServerEvent.UPDATE_PUBLIC_MATCHES);
    };
  }, [socket]);

  useEffect(() => {
    setLoading(false);
  }, [publicMatches]);

  const onRefresh = () => {
    socket.emit(EClientEvent.LEAVE_ROOM, "searching");
    setTimeout(() => {
      socket.emit(EClientEvent.JOIN_ROOM, "searching");
    }, 500);
  };

  return (
    <PageContainer maxWidth="lg">
      <CommunityPageRoot>
        <CommunityHero tone="matches">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={2.5}
          >
            <Stack direction="row" alignItems="center" gap={1.75} minWidth={0}>
              <CommunityHeroIcon>
                <ManageSearch />
              </CommunityHeroIcon>
              <Box minWidth={0}>
                <Typography
                  color="warning.light"
                  fontWeight={950}
                  letterSpacing="0.12em"
                  variant="overline"
                >
                  Partidas públicas
                </Typography>
                <Typography component="h1" fontWeight={950} lineHeight={1.05} variant="h4">
                  Encontrá una mesa
                </Typography>
                <Typography color="text.secondary" mt={0.65} variant="body2">
                  Entrá a un lobby abierto o creá una partida con tus reglas.
                </Typography>
              </Box>
            </Stack>

            <CommunityHeroMeta>
              <GroupsOutlined color="success" />
              <Typography fontWeight={900} variant="body2">
                {stats.onlinePlayers.length} jugadores
              </Typography>
            </CommunityHeroMeta>
          </Stack>
        </CommunityHero>

        <CommunitySurface aria-label="Explorador de partidas">
          <CommunitySurfaceHeader>
            <Box>
              <Typography component="h2" fontWeight={950} variant="h6">
                Mesas disponibles
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {isConnected
                  ? "La lista se actualiza en tiempo real."
                  : "Reconectando con el servidor…"}
              </Typography>
            </Box>
            <Tooltip title="Actualizar partidas">
              <span>
                <RefreshButton
                  aria-label="Actualizar partidas"
                  color="warning"
                  disabled={!isConnected || isLoading}
                  onClick={() => {
                    onRefresh();
                    setLoading(true);
                  }}
                >
                  {isLoading ? (
                    <CircularProgress color="inherit" size="1.3rem" />
                  ) : (
                    <RefreshRounded />
                  )}
                </RefreshButton>
              </span>
            </Tooltip>
          </CommunitySurfaceHeader>

          {isConnected ? (
            <PublicMatchesList matches={publicMatches} />
          ) : (
            <Stack alignItems="center" justifyContent="center" minHeight="14rem" gap={1.25}>
              <CircularProgress color="warning" size={32} />
              <Typography color="text.secondary" variant="body2">
                Buscando mesas…
              </Typography>
            </Stack>
          )}

          {isDraining ? (
            <Box px={{ xs: CONTENT_GUTTER.mobile, sm: CONTENT_GUTTER.desktop }} pb={1.5}>
              <AdmissionNotice compact />
            </Box>
          ) : null}

          <MatchesFooter>
            <Box>
              <Typography fontWeight={900}>¿No ves la mesa que buscás?</Typography>
              <Typography color="text.secondary" variant="body2">
                Abrí una nueva y compartí el código con tus amigos.
              </Typography>
            </Box>
            <CreateMatchButton color="warning" variant="contained" />
          </MatchesFooter>
        </CommunitySurface>
      </CommunityPageRoot>
    </PageContainer>
  );
};
