import { Box, IconButton, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { BoardLayoutModel } from "./boardLayoutPresets";

type MatchTopBarProps = {
  myTeamIdx: 0 | 1;
  myPoints: number;
  opponentPoints: number;
  roundLabel: string;
  layout: BoardLayoutModel;
  canSay: boolean;
  pauseRequested: boolean;
  canAbandon: boolean;
  onOpenRules: () => void;
  onTogglePause: () => void;
  onOpenAbandon: () => void;
};

export const MatchTopBar = ({
  myTeamIdx,
  myPoints,
  opponentPoints,
  roundLabel,
  layout,
  canSay,
  pauseRequested,
  canAbandon,
  onOpenRules,
  onTogglePause,
  onOpenAbandon,
}: MatchTopBarProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

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
        <Paper sx={(theme) => ({ ...theme.trucoshiUi.match.scoreCard, justifySelf: useWideGrid ? "start" : "center" })}>
          <Typography fontSize={{ xs: "0.82rem", sm: "0.78rem" }} color="grey.300" fontWeight={600}>
            {myTeamIdx === 0 ? "Nosotros" : "Ellos"}
          </Typography>
          <Typography fontSize={{ xs: "2.08rem", sm: "1.82rem" }} lineHeight={1} fontWeight={900} color="warning.light">
            {myPoints}
          </Typography>
        </Paper>

        <Paper sx={(theme) => ({ ...theme.trucoshiUi.match.topBadge, mt: 0.12 })}>
          <Typography color="common.white" fontWeight={800} fontSize={{ xs: "1.24rem", sm: "1.08rem" }}>
            {roundLabel}
          </Typography>
        </Paper>

        <Box sx={{ justifySelf: useWideGrid ? "end" : "center", position: "relative" }}>
          <Paper sx={(theme) => theme.trucoshiUi.match.scoreCard}>
            <Typography fontSize={{ xs: "0.82rem", sm: "0.78rem" }} color="grey.300" fontWeight={600}>
              {myTeamIdx === 0 ? "Ellos" : "Nosotros"}
            </Typography>
            <Typography fontSize={{ xs: "2.08rem", sm: "1.82rem" }} lineHeight={1} fontWeight={900} color="warning.light">
              {opponentPoints}
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
            onOpenRules();
            setMenuAnchor(null);
          }}
        >
          Reglas
        </MenuItem>
        <MenuItem
          disabled={!canSay || pauseRequested}
          onClick={() => {
            onTogglePause();
            setMenuAnchor(null);
          }}
        >
          {pauseRequested ? "Esperando pausa" : "Pausa"}
        </MenuItem>
        {canAbandon ? (
          <MenuItem
            onClick={() => {
              onOpenAbandon();
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
