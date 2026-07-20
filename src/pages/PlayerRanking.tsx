import { EmojiEventsRounded, GroupsOutlined, TrendingUpRounded } from "@mui/icons-material";
import {
  alpha,
  Box,
  CircularProgress,
  List,
  Stack,
  styled,
  type Theme,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { EClientEvent, type IPlayerRanking } from "trucoshi";
import {
  CommunityHero,
  CommunityHeroIcon,
  CommunityHeroMeta,
  CommunityPageRoot,
  CommunitySurface,
  CommunitySurfaceHeader,
} from "../components/community/communityUi";
import { CONTENT_GUTTER, contentGutterSx } from "../components/layout/contentLayout";
import { useToast } from "../hooks/useToast";
import { Link } from "../shared/Link";
import { PageContainer } from "../shared/PageContainer";
import { UserAvatar } from "../shared/UserAvatar";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";

const getWinRate = ({ win, loss }: Pick<IPlayerRanking, "win" | "loss">) => {
  const total = win + loss;
  return total ? Math.round((win / total) * 100) : 0;
};

const getPodiumTone = (theme: Theme, position: number) => {
  const palette =
    position === 1
      ? theme.palette.secondary
      : position === 2
        ? theme.palette.error
        : position === 3
          ? theme.palette.primary
          : null;

  if (!palette) {
    return null;
  }

  return {
    accent: palette.main,
    foreground: theme.palette.mode === "dark" ? palette.light : palette.dark,
  };
};

const RankingHeaderRow = styled(Box)(({ theme }) => ({
  display: "none",
  gridTemplateColumns: "3.25rem minmax(0, 1fr) 7rem 7rem",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, CONTENT_GUTTER.desktop),
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  color: theme.palette.text.secondary,
  fontSize: "0.68rem",
  fontWeight: 900,
  letterSpacing: "0.075em",
  textTransform: "uppercase",
  [theme.breakpoints.up("sm")]: {
    display: "grid",
  },
}));

const RankingRow = styled(Link)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "2.75rem minmax(0, 1fr) auto",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, CONTENT_GUTTER.mobile),
  color: "inherit",
  textDecoration: "none",
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  "&:last-child": { borderBottom: 0 },
  "&:hover": {
    color: "inherit",
    textDecoration: "none",
    backgroundColor: theme.palette.action.hover,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.warning.main}`,
    outlineOffset: -2,
  },
  "&:hover .ranking-position-marker[data-podium='true']": {
    transform: "translateY(-1px) scale(1.045)",
  },
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "3.25rem minmax(0, 1fr) 7rem 7rem",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.4, CONTENT_GUTTER.desktop),
  },
}));

const RankingPositionMarker = styled(Box, {
  shouldForwardProp: (prop) => prop !== "rankPosition",
})<{ rankPosition: number }>(({ theme, rankPosition }) => {
  const podiumTone = getPodiumTone(theme, rankPosition);
  const rankColor = podiumTone?.foreground ?? theme.palette.text.disabled;
  const accentColor = podiumTone?.accent ?? theme.palette.text.disabled;

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: "50%",
    color: rankColor,
    backgroundColor: alpha(accentColor, podiumTone ? 0.18 : 0.06),
    border: `1px solid ${alpha(accentColor, podiumTone ? 0.48 : 0.1)}`,
    boxShadow: rankPosition === 1 ? `0 6px 18px ${alpha(accentColor, 0.2)}` : "none",
    fontWeight: 950,
    transition: "transform 160ms ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  };
});

export const PlayerRanking = () => {
  const context = useContext(TrucoshiContext);
  const toast = useToast();

  const [isLoading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<IPlayerRanking[]>([]);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    setLoading(true);
    context.socket.emit(EClientEvent.LIST_RANKING, {}, ({ success, ranking, error }) => {
      if (error) {
        toast.error(error.message);
      }

      if (success) {
        setRanking(ranking);
      }

      setLoading(false);
    });
  }, [context.socket, toast]);

  const leader = ranking[0];

  return (
    <PageContainer maxWidth="lg">
      <CommunityPageRoot>
        <CommunityHero tone="ranking">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={2.5}
          >
            <Stack direction="row" alignItems="center" gap={1.75} minWidth={0}>
              <CommunityHeroIcon
                sx={(theme) => ({
                  color: theme.palette.primary.light,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: alpha(theme.palette.primary.main, 0.26),
                })}
              >
                <EmojiEventsRounded />
              </CommunityHeroIcon>
              <Box minWidth={0}>
                <Typography
                  color="primary.light"
                  fontWeight={950}
                  letterSpacing="0.12em"
                  variant="overline"
                >
                  Competencia
                </Typography>
                <Typography component="h1" fontWeight={950} lineHeight={1.05} variant="h4">
                  Ranking de jugadores
                </Typography>
                <Typography color="text.secondary" mt={0.65} variant="body2">
                  Posiciones por rendimiento en partidas completadas.
                </Typography>
              </Box>
            </Stack>

            <CommunityHeroMeta>
              <GroupsOutlined color="success" />
              <Box>
                <Typography
                  color="text.secondary"
                  fontSize="0.68rem"
                  fontWeight={850}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  Comunidad
                </Typography>
                <Typography fontWeight={900} variant="body2">
                  {context.state.stats.onlinePlayers.length} online
                </Typography>
              </Box>
            </CommunityHeroMeta>
          </Stack>
        </CommunityHero>

        <CommunitySurface aria-label="Tabla de posiciones">
          <CommunitySurfaceHeader>
            <Box>
              <Typography component="h2" fontWeight={950} variant="h6">
                Tabla general
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {leader
                  ? `${leader.name} lidera la clasificación.`
                  : "La clasificación aparecerá acá."}
              </Typography>
            </Box>
            <TrendingUpRounded color="secondary" />
          </CommunitySurfaceHeader>

          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" minHeight="18rem" gap={1.25}>
              <CircularProgress color="warning" size={34} />
              <Typography color="text.secondary" variant="body2">
                Actualizando posiciones…
              </Typography>
            </Stack>
          ) : ranking.length ? (
            <>
              <RankingHeaderRow>
                <span>Pos.</span>
                <span>Jugador</span>
                <span>Partidas</span>
                <span>Efectividad</span>
              </RankingHeaderRow>
              <List disablePadding aria-label="Ranking de jugadores">
                {ranking.map((player, index) => {
                  const position = index + 1;
                  const games = player.win + player.loss;
                  return (
                    <RankingRow
                      key={player.accountId}
                      to={`/profile/${player.accountId}`}
                    >
                      <RankingPositionMarker
                        className="ranking-position-marker"
                        data-podium={position <= 3 ? "true" : undefined}
                        rankPosition={position}
                      >
                        {position}
                      </RankingPositionMarker>

                      <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
                        <UserAvatar status account={player} />
                        <Box minWidth={0}>
                          <Typography fontWeight={900} noWrap>
                            {player.name}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            fontSize="0.75rem"
                            sx={{ display: { xs: "block", sm: "none" } }}
                          >
                            {games} {games === 1 ? "partida" : "partidas"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        color="text.secondary"
                        fontWeight={850}
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        {games}
                      </Typography>
                      <Typography
                        color={position <= 3 ? "warning.light" : "text.primary"}
                        fontWeight={950}
                        textAlign="right"
                      >
                        {getWinRate(player)}%
                      </Typography>
                    </RankingRow>
                  );
                })}
              </List>
            </>
          ) : (
            <Stack
              alignItems="center"
              px={contentGutterSx}
              py={{ xs: 5, sm: 7 }}
              textAlign="center"
            >
              <EmojiEventsRounded color="disabled" sx={{ fontSize: "2.5rem" }} />
              <Typography fontWeight={900} mt={1}>
                Todavía no hay posiciones
              </Typography>
              <Typography color="text.secondary" variant="body2">
                La tabla se completa cuando terminan las primeras partidas.
              </Typography>
            </Stack>
          )}
        </CommunitySurface>
      </CommunityPageRoot>
    </PageContainer>
  );
};
