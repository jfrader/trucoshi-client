import { alpha, Box, Stack, styled } from "@mui/material";
import { CONTENT_GUTTER, ContentPageStack } from "../layout/contentLayout";

export const CommunityPageRoot = styled(ContentPageStack)(({ theme }) => ({
  maxWidth: "64rem",
  paddingBottom: theme.spacing(2),
}));

export const CommunityHero = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tone",
})<{ tone: "ranking" | "matches" }>(({ theme, tone }) => {
  const accent = tone === "ranking" ? theme.palette.primary.main : theme.palette.warning.main;

  return {
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    padding: theme.spacing(2.25),
    textAlign: "left",
    borderRadius: "1.2rem",
    border: `1px solid ${alpha(accent, theme.palette.mode === "dark" ? 0.3 : 0.24)}`,
    background: `radial-gradient(circle at 88% 14%, ${alpha(accent, 0.2)}, transparent 34%), linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.default, 0.92)})`,
    boxShadow: `0 18px 38px ${alpha(theme.palette.common.black, 0.2)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.06)}`,
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(3),
    },
  };
});

export const CommunityHeroIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 54,
  height: 54,
  flexShrink: 0,
  borderRadius: "1rem",
  color: theme.palette.warning.light,
  backgroundColor: alpha(theme.palette.warning.main, 0.12),
  border: `1px solid ${alpha(theme.palette.warning.main, 0.26)}`,
  "& svg": {
    fontSize: "1.8rem",
  },
}));

export const CommunityHeroMeta = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  flexShrink: 0,
  gap: theme.spacing(1.2),
  padding: theme.spacing(1.1, 1.5),
  borderRadius: "0.9rem",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.09)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.32),
}));

export const CommunitySurface = styled("section")(({ theme }) => ({
  overflow: "hidden",
  textAlign: "left",
  borderRadius: "1.15rem",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  background: theme.palette.background.paper,
  boxShadow: `0 12px 26px ${alpha(theme.palette.common.black, 0.18)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.045)}`,
}));

export const CommunitySurfaceHeader = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(CONTENT_GUTTER.mobile),
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  backgroundColor: alpha(theme.palette.text.primary, 0.025),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2, CONTENT_GUTTER.desktop),
  },
}));
