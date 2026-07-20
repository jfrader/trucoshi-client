import { Box, IconButton, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useState } from "react";
import { useBoardLayout } from "../../board";
import { useMatchGameplay } from "./MatchGameplayContext";
import { getTeamDisplayName } from "../../utils/team";

const getPointsStageColor = (label: string) =>
  label === "Buenas" ? "success.light" : "warning.light";

export const MatchTopBar = () => {
  const {
    state: { match, rounds, canSay, pauseRequested, me },
    score: { myTeamIdx, myTeamPoints, myTeamPointsLabel, opponentTeamPoints, opponentTeamPointsLabel },
    actions: { setRulesOpen, pauseMatch, setAbandonOpen },
  } = useMatchGameplay();
  const layout = useBoardLayout();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const canAbandon = Boolean(me && !me.abandoned);
  const roundLabel = `Ronda ${Math.min(Math.max(rounds.length, 1), 3)} / 3`;
  const opponentTeamIdx = myTeamIdx === 0 ? 1 : 0;
  const myTeamLabel = getTeamDisplayName(match, myTeamIdx);
  const opponentTeamLabel = getTeamDisplayName(match, opponentTeamIdx);

  const useWideGrid =
    layout.profile === "desktop" || layout.profile === "tabletWide" || layout.profile === "tablet";

  return (
    <>
      <Box
        sx={(theme) => ({
          width: useWideGrid ? "100%" : theme.trucoshiUi.navigation.gameTopBarWidth,
          maxWidth: useWideGrid ? "35rem" : "none",
          margin: "0 auto",
          px: useWideGrid ? { xs: 0.35, sm: 8, md: 2 } : 0,
          transform: `translateY(${layout.match?.topBarTranslateY || "0px"})`,
          display: "grid",
          gridTemplateColumns: useWideGrid
            ? "1fr auto 1fr"
            : "minmax(0, 1fr) minmax(5.1rem, auto) minmax(0, 1fr)",
          alignItems: "start",
          gap: { xs: 0.35, sm: 0.75 },
          justifyContent: "center",
        })}
      >
        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.scoreCard,
            justifySelf: useWideGrid ? "start" : "center",
            ...(useWideGrid ? {} : { width: "100%", minWidth: 0 }),
          })}
        >
          <Typography
            noWrap={!useWideGrid}
            fontSize={{ xs: "0.72rem", sm: "0.78rem" }}
            color="grey.300"
            fontWeight={600}
            title={myTeamLabel}
          >
            {myTeamLabel}
          </Typography>
          <Typography
            fontSize={{ xs: "2.08rem", sm: "1.82rem" }}
            lineHeight={1}
            fontWeight={900}
            color={getPointsStageColor(myTeamPointsLabel)}
          >
            {myTeamPoints}
          </Typography>
          <Typography fontSize="0.68rem" lineHeight={1} color="grey.400" fontWeight={700}>
            {myTeamPointsLabel}
          </Typography>
        </Paper>

        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.topBadge,
          })}
        >
          <Typography color="common.white" fontWeight={800} fontSize={{ xs: "1.24rem", sm: "1.08rem" }}>
            {roundLabel}
          </Typography>
        </Paper>

        <Box
          sx={{
            justifySelf: useWideGrid ? "end" : "center",
            position: "relative",
            ...(useWideGrid ? {} : { width: "100%", minWidth: 0 }),
          }}
        >
          <Paper
            sx={(theme) => ({
              ...theme.trucoshiUi.match.scoreCard,
              ...(useWideGrid ? {} : { width: "100%", minWidth: 0 }),
            })}
          >
            <Typography
              noWrap={!useWideGrid}
              fontSize={{ xs: "0.72rem", sm: "0.78rem" }}
              color="grey.300"
              fontWeight={600}
              title={opponentTeamLabel}
            >
              {opponentTeamLabel}
            </Typography>
            <Typography
              fontSize={{ xs: "2.08rem", sm: "1.82rem" }}
              lineHeight={1}
              fontWeight={900}
              color={getPointsStageColor(opponentTeamPointsLabel)}
            >
              {opponentTeamPoints}
            </Typography>
            <Typography
              fontSize="0.68rem"
              lineHeight={1}
              color="grey.400"
              fontWeight={700}
            >
              {opponentTeamPointsLabel}
            </Typography>
          </Paper>

          <IconButton
            aria-label="Opciones de partida"
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
