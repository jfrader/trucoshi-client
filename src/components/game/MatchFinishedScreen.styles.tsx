import { Box, Container, Stack, styled } from "@mui/material";

const APP_VIEWPORT_HEIGHT = "var(--trucoshi-viewport-height, 100dvh)";

export const FinishedScreenShell = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  width: "100%",
  height: APP_VIEWPORT_HEIGHT,
  maxHeight: APP_VIEWPORT_HEIGHT,
  overflow: "hidden",
  paddingTop: "calc(env(safe-area-inset-top) + 0.65rem)",
  paddingBottom: "calc(env(safe-area-inset-bottom) + 0.7rem)",
  [theme.breakpoints.up("sm")]: {
    paddingTop: "calc(env(safe-area-inset-top) + 0.9rem)",
    paddingBottom: "calc(env(safe-area-inset-bottom) + 0.9rem)",
  },
}));

export const FinishedScreenContent = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(1.5),
  [theme.breakpoints.up("sm")]: { gap: theme.spacing(2) },
  "@media (max-height: 640px)": { gap: theme.spacing(0.85) },
}));

export const FinishedResultPanel = styled(Box)(({ theme }) => ({
  position: "relative",
  flex: "0 0 auto",
  overflow: "hidden",
  boxSizing: "border-box",
  minHeight: "10.75rem",
  padding: theme.spacing(2, 2.25),
  textAlign: "left",
  ...theme.trucoshiUi.account.hero,
  [theme.breakpoints.up("sm")]: {
    minHeight: "11.25rem",
    padding: theme.spacing(2.5, 3),
  },
  "@media (max-height: 640px)": {
    minHeight: "auto",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

export const FinishedResultBody = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
  marginTop: theme.spacing(1.5),
  "& > :first-of-type": { flex: "1 1 0", minWidth: 0 },
  [theme.breakpoints.up("sm")]: { gap: theme.spacing(2) },
}));

export const FinishedScoreboard = styled(Box)(({ theme }) => ({
  display: "flex",
  minWidth: "10.75rem",
  overflow: "hidden",
  ...theme.trucoshiUi.account.inset,
  "& > *": { flex: "1 1 0", minWidth: 0 },
  "& > * + *": { borderLeft: `1px solid ${theme.trucoshiUi.account.divider}` },
  [theme.breakpoints.down("sm")]: { minWidth: "9.5rem" },
}));

export const FinishedScoreCell = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.25),
  textAlign: "center",
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(1.5, 1.75) },
}));

export const FinishedActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing(1),
  "& .MuiButton-root": {
    minWidth: 0,
    minHeight: 48,
    paddingInline: theme.spacing(0.75),
    borderRadius: "0.9rem",
    fontSize: "clamp(0.68rem, 2.9vw, 0.82rem)",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  "& .MuiButton-startIcon": { display: "none" },
  [theme.breakpoints.up("sm")]: {
    "& .MuiButton-root": {
      fontSize: theme.typography.button.fontSize,
      paddingInline: theme.spacing(2),
    },
    "& .MuiButton-startIcon": { display: "inherit" },
  },
  "@media (max-height: 640px)": {
    "& .MuiButton-root": { minHeight: 40, paddingBlock: theme.spacing(0.35) },
  },
}));

export const FinishedChatStage = styled(Box)(({ theme }) => ({
  position: "relative",
  flex: "1 1 48%",
  minHeight: "42%",
  width: "100%",
  overflow: "hidden",
  borderRadius: 0,
  border: `1px solid ${theme.trucoshiUi.account.divider}`,
  background: theme.trucoshiUi.content.surface,
  "& .MuiPaper-root, & .MuiButtonGroup-root, & .MuiOutlinedInput-root, & .MuiOutlinedInput-notchedOutline, & .MuiButtonBase-root":
    { borderRadius: "0 !important" },
}));
