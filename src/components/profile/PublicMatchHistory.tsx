import {
  ChevronRightRounded,
  CurrencyBitcoin,
  EmojiEventsOutlined,
  SmartToyOutlined,
  SportsEsportsOutlined,
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type { IAccountDetails } from "trucoshi";
import { contentGutterSx } from "../layout/contentLayout";

type PublicMatches = IAccountDetails["matches"];

export const PublicMatchHistory = ({
  accountId,
  matches,
  viewerAccountId,
  onOpenMatch,
}: {
  accountId: number;
  matches: PublicMatches;
  viewerAccountId?: number;
  onOpenMatch: (matchId: number) => void;
}) => {
  if (!matches.length) {
    return (
      <Box px={contentGutterSx} py={{ xs: 5, sm: 7 }} textAlign="center">
        <SportsEsportsOutlined color="disabled" sx={{ fontSize: "2.25rem" }} />
        <Typography fontWeight={850} mt={1}>
          Sin partidas registradas
        </Typography>
        <Typography color="text.secondary" variant="body2">
          El historial aparecerá después de completar una partida.
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding aria-label="Historial de partidas">
      {matches.map((match) => {
        const player = match.players.find((candidate) => candidate.accountId === accountId);
        const hasResult = match.winnerIdx !== null && match.winnerIdx !== undefined;
        const isWinner = hasResult && match.winnerIdx === player?.teamIdx;
        const viewerPlayed = match.players.some(
          (candidate) => candidate.accountId === viewerAccountId,
        );
        const hasBots = match.players.some((candidate) => Boolean(candidate.bot));
        const outcome = !hasResult ? "Sin resultado" : isWinner ? "Victoria" : "Derrota";

        return (
          <ListItemButton
            key={match.id}
            divider
            onClick={() => onOpenMatch(match.id)}
            sx={(theme) => ({
              gap: { xs: 0.5, sm: 1 },
              px: contentGutterSx,
              py: { xs: 1.25, sm: 1.5 },
              borderColor: theme.trucoshiUi.content.divider,
              "& .profile-history-chevron": {
                transition: theme.transitions.create("transform", {
                  duration: theme.transitions.duration.shorter,
                }),
              },
              "&:hover .profile-history-chevron": { transform: "translateX(3px)" },
              "@media (prefers-reduced-motion: reduce)": {
                "& .profile-history-chevron": { transition: "none" },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: { xs: 36, sm: 42 } }}>
              {isWinner ? (
                <EmojiEventsOutlined color="warning" />
              ) : (
                <SportsEsportsOutlined color={hasResult ? "action" : "disabled"} />
              )}
            </ListItemIcon>

            <ListItemText
              primary={
                <Stack direction="row" alignItems="baseline" gap={1} minWidth={0}>
                  <Typography fontWeight={900}>{outcome}</Typography>
                  <Typography color="text.disabled" fontSize="0.75rem" noWrap>
                    {dayjs(match.createdAt).format("DD/MM/YYYY")}
                  </Typography>
                </Stack>
              }
              secondary={match.sessionId}
              secondaryTypographyProps={{ noWrap: true }}
              sx={{ minWidth: 0, my: 0 }}
            />

            <Stack direction="row" alignItems="center" gap={{ xs: 0.5, sm: 0.8 }}>
              {(match.bet?.satsPerPlayer || 0) > 0 && viewerPlayed ? (
                <Tooltip title="Partida con sats">
                  <CurrencyBitcoin color="warning" fontSize="small" />
                </Tooltip>
              ) : null}
              {hasBots ? (
                <Tooltip title="Partida con bots">
                  <SmartToyOutlined color="info" fontSize="small" />
                </Tooltip>
              ) : null}
              <ChevronRightRounded
                className="profile-history-chevron"
                color="action"
                fontSize="small"
              />
            </Stack>
          </ListItemButton>
        );
      })}
    </List>
  );
};
