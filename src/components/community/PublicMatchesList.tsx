import {
  AddBoxOutlined,
  ChevronRightRounded,
  GroupsOutlined,
  VideogameAssetOutlined,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Chip,
  List,
  ListItemButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { EMatchState, type IPublicMatchInfo } from "trucoshi";
import { CONTENT_GUTTER, contentGutterSx } from "../layout/contentLayout";

const MATCH_STATE_LABELS: Record<
  EMatchState,
  { label: string; color: "error" | "warning" | "success" | "info" }
> = {
  [EMatchState.FINISHED]: { label: "Terminada", color: "error" },
  [EMatchState.STARTED]: { label: "En juego", color: "warning" },
  [EMatchState.UNREADY]: { label: "En lobby", color: "success" },
  [EMatchState.READY]: { label: "Lista", color: "info" },
  [EMatchState.PAUSED]: { label: "En pausa", color: "warning" },
};

const MatchListRow = styled(ListItemButton)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
  alignItems: "center",
  gap: theme.spacing(1.2),
  padding: theme.spacing(1.4, CONTENT_GUTTER.mobile),
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  "&:last-child": { borderBottom: 0 },
  "& .matches-row-chevron": {
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shorter,
    }),
  },
  "&:hover .matches-row-chevron": { transform: "translateX(3px)" },
  "@media (prefers-reduced-motion: reduce)": {
    "& .matches-row-chevron": { transition: "none" },
  },
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "auto minmax(0, 1fr) auto auto auto",
    gap: theme.spacing(1.75),
    padding: theme.spacing(1.65, CONTENT_GUTTER.desktop),
  },
}));

const MatchIconFrame = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 42,
  height: 42,
  borderRadius: "0.85rem",
  color: theme.palette.warning.light,
  backgroundColor: alpha(theme.palette.warning.main, 0.1),
  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
}));

export const PublicMatchesList = ({ matches }: { matches: IPublicMatchInfo[] }) => {
  const navigate = useNavigate();

  if (!matches.length) {
    return (
      <Stack alignItems="center" px={contentGutterSx} py={{ xs: 5, sm: 7 }} textAlign="center">
        <VideogameAssetOutlined color="disabled" sx={{ fontSize: "2.5rem" }} />
        <Typography fontWeight={900} mt={1}>
          No hay mesas públicas
        </Typography>
        <Typography color="text.secondary" maxWidth="24rem" variant="body2">
          Actualizá la búsqueda o creá una partida para abrir la primera mesa.
        </Typography>
      </Stack>
    );
  }

  return (
    <List disablePadding aria-label="Partidas públicas">
      {matches.map((info) => {
        const state = MATCH_STATE_LABELS[info.state];
        const isStarted =
          info.state === EMatchState.STARTED || info.state === EMatchState.FINISHED;
        const matchTitle = info.createdFromQueue
          ? "Partida rankeada"
          : `Mesa de ${info.ownerId}`;

        return (
          <MatchListRow
            key={info.matchSessionId}
            onClick={() =>
              navigate(
                isStarted ? `/match/${info.matchSessionId}` : `/lobby/${info.matchSessionId}`,
              )
            }
          >
            <MatchIconFrame>
              {info.createdFromQueue ? (
                <VideogameAssetOutlined fontSize="small" />
              ) : (
                <AddBoxOutlined fontSize="small" />
              )}
            </MatchIconFrame>

            <Box minWidth={0}>
              <Typography fontWeight={900} noWrap>
                {matchTitle}
              </Typography>
              <Typography color="text.secondary" fontSize="0.78rem" noWrap>
                Código {info.matchSessionId}
              </Typography>
            </Box>

            <Stack alignItems="flex-end" gap={0.5}>
              <Stack direction="row" alignItems="center" gap={0.55}>
                <GroupsOutlined color="action" sx={{ fontSize: "1rem" }} />
                <Typography fontWeight={900} variant="body2">
                  {info.players}/{isStarted ? info.players : info.options.maxPlayers}
                </Typography>
              </Stack>
              <Chip
                color={state.color}
                label={state.label}
                size="small"
                variant="outlined"
                sx={{ display: { xs: "inline-flex", sm: "none" }, height: 22, fontWeight: 850 }}
              />
            </Stack>

            <Chip
              color={state.color}
              label={state.label}
              size="small"
              variant="outlined"
              sx={{ display: { xs: "none", sm: "inline-flex" }, fontWeight: 850 }}
            />
            <ChevronRightRounded className="matches-row-chevron" color="action" />
          </MatchListRow>
        );
      })}
    </List>
  );
};
