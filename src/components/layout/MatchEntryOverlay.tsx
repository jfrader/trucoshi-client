import { Box, Stack, Typography, styled, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { TrucoshiText } from "../../shared/TrucoshiText";

const OverlayRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "fadeMs",
})<{ open: boolean; fadeMs: number }>(({ fadeMs, open, theme }) => ({
  ...theme.trucoshiUi.match.entryOverlay.root,
  position: "fixed",
  inset: 0,
  zIndex: theme.zIndex.modal + 10,
  display: "grid",
  placeItems: "center",
  maxHeight: "100dvh",
  overflow: "hidden",
  opacity: open ? 1 : 0,
  pointerEvents: "auto",
  transition: `opacity ${fadeMs}ms ease`,
}));

const OverlayContent = styled(Stack)(({ theme }) => theme.trucoshiUi.match.entryOverlay.content);

const ProgressTrack = styled(Box)(({ theme }) => theme.trucoshiUi.match.entryOverlay.progressTrack);

const ProgressFill = styled(Box)(({ theme }) => ({
  ...theme.trucoshiUi.match.entryOverlay.progressFill,
  animation: "match-entry-progress 1.05s ease-in-out infinite alternate",
  "@keyframes match-entry-progress": {
    "0%": {
      transform: "translateX(-45%)",
    },
    "100%": {
      transform: "translateX(180%)",
    },
  },
}));

export const MatchEntryOverlay = () => {
  const theme = useTheme();
  const { fadeMs, holdMs } = theme.trucoshiUi.match.entryOverlay;
  const [isMounted, setMounted] = useState(true);
  const [isOpen, setOpen] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setOpen(false);
    }, holdMs);
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, holdMs + fadeMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [fadeMs, holdMs]);

  if (!isMounted) {
    return null;
  }

  return (
    <OverlayRoot
      aria-label="Preparando partida"
      data-testid="match-entry-overlay"
      fadeMs={fadeMs}
      open={isOpen}
      role="status"
    >
      <OverlayContent>
        <Stack gap={2} alignItems="center">
          <Box sx={theme.trucoshiUi.match.entryOverlay.logo}>
            <TrucoshiText style={{ display: "block", height: "auto", width: "100%" }} />
          </Box>
          <Typography sx={theme.trucoshiUi.match.entryOverlay.subtitle} variant="body2">
            Preparando partida
          </Typography>
        </Stack>
        <ProgressTrack aria-hidden="true">
          <ProgressFill />
        </ProgressTrack>
      </OverlayContent>
    </OverlayRoot>
  );
};
