import { Box, IconButton, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useBoardLayout } from "../../board";
import { useMatchGameplay } from "./MatchGameplayContext";

export const MatchTopBar = () => {
  const {
    state: { rounds, canSay, pauseRequested, me },
    score: { myTeamIdx, myTeamPoints, myTeamPointsLabel, opponentTeamPoints, opponentTeamPointsLabel },
    actions: { setRulesOpen, pauseMatch, setAbandonOpen },
  } = useMatchGameplay();
  const layout = useBoardLayout();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const canAbandon = Boolean(me && !me.abandoned);
  const roundLabel = `Ronda ${Math.min(Math.max(rounds.length, 1), 3)} / 3`;

  const useWideGrid = useMemo(
    () => layout.profile === "desktop" || layout.profile === "tabletWide",
    [layout.profile]
  );

  return (
    <>
      <Box
        sx={{
          width: useWideGrid ? "100%" : "auto",
          maxWidth: useWideGrid ? "37rem" : "fit-content",
          margin: "0 auto",
          px: useWideGrid ? { xs: 0.35, sm: 0.5 } : 0,
          display: "grid",
          gridTemplateColumns: useWideGrid ? "1fr auto 1fr" : "auto auto auto",
          alignItems: "start",
          gap: { xs: 0.55, sm: 0.75 },
          justifyContent: "center",
        }}
      >
        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.scoreCard,
            justifySelf: useWideGrid ? "start" : "center",
          })}
        >
          <Typography fontSize={{ xs: "0.82rem", sm: "0.78rem" }} color="grey.300" fontWeight={600}>
            {myTeamIdx === 0 ? "Nosotros" : "Ellos"}
          </Typography>
          <Typography fontSize={{ xs: "2.08rem", sm: "1.82rem" }} lineHeight={1} fontWeight={900} color="warning.light">
            {myTeamPoints}
          </Typography>
          <Typography fontSize={{ xs: "0.64rem", sm: "0.6rem" }} lineHeight={1} color="grey.400" fontWeight={700}>
            {myTeamPointsLabel}
          </Typography>
        </Paper>

        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.topBadge,
            mt: 0.12,
          })}
        >
          <Typography color="common.white" fontWeight={800} fontSize={{ xs: "1.24rem", sm: "1.08rem" }}>
            {roundLabel}
          </Typography>
        </Paper>

        <Box sx={{ justifySelf: useWideGrid ? "end" : "center", position: "relative" }}>
          <Paper
            sx={(theme) => ({
              ...theme.trucoshiUi.match.scoreCard,
            })}
          >
            <Typography fontSize={{ xs: "0.82rem", sm: "0.78rem" }} color="grey.300" fontWeight={600}>
              {myTeamIdx === 0 ? "Ellos" : "Nosotros"}
            </Typography>
            <Typography fontSize={{ xs: "2.08rem", sm: "1.82rem" }} lineHeight={1} fontWeight={900} color="warning.light">
              {opponentTeamPoints}
            </Typography>
            <Typography
              fontSize={{ xs: "0.64rem", sm: "0.6rem" }}
              lineHeight={1}
              color="grey.400"
              fontWeight={700}
            >
              {opponentTeamPointsLabel}
            </Typography>
          </Paper>

          <IconButton
            size="small"
            sx={(theme) => ({
              ...theme.trucoshiUi.match.settingsButton,
              position: "absolute",
              top: "calc(100% + 0.4rem)",
              right: 0,
            })}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <Settings fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Menu
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setRulesOpen(true);
            setMenuAnchor(null);
          }}
        >
          Reglas
        </MenuItem>
        <MenuItem
          disabled={!canSay || pauseRequested}
          onClick={() => {
            pauseMatch(true);
            setMenuAnchor(null);
          }}
        >
          {pauseRequested ? "Esperando pausa" : "Pausa"}
        </MenuItem>
        {canAbandon ? (
          <MenuItem
            onClick={() => {
              setAbandonOpen(true);
              setMenuAnchor(null);
            }}
          >
            Rendirse
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
};
