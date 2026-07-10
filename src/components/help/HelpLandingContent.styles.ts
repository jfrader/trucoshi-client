import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "../../shared/Link";

export const HelpDirectory = styled("section")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  textAlign: "left",
}));

export const HelpDirectoryHeader = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(1),
  maxWidth: "42rem",
}));

export const HelpDirectoryTitle = styled("h2")(({ theme }) => ({
  margin: 0,
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
  fontWeight: 920,
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
}));

export const HelpDirectoryLead = styled(Typography)(({ theme }) => ({
  color: theme.trucoshiUi.seo.textSecondary,
  lineHeight: 1.7,
}));

export const HelpTopicList = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
}));

export const HelpTopic = styled("details")(({ theme }) => ({
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  "&[open] > summary::after": {
    content: '"−"',
    color: theme.trucoshiUi.seo.accent,
  },
}));

export const HelpTopicSummary = styled("summary")(({ theme }) => ({
  position: "relative",
  display: "grid",
  gap: theme.spacing(0.75),
  padding: theme.spacing(3, 5, 3, 0),
  color: theme.trucoshiUi.seo.textPrimary,
  cursor: "pointer",
  listStyle: "none",
  "&::-webkit-details-marker": {
    display: "none",
  },
  "&::after": {
    content: '"+"',
    position: "absolute",
    top: theme.spacing(3),
    right: 0,
    color: theme.trucoshiUi.seo.textSecondary,
    fontSize: "1.4rem",
    fontWeight: 500,
  },
}));

export const HelpTopicKicker = styled("span")(({ theme }) => ({
  color: theme.trucoshiUi.seo.accent,
  fontSize: "0.68rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
}));

export const HelpTopicTitle = styled("span")(({ theme }) => ({
  fontSize: "clamp(1.3rem, 2.5vw, 2rem)",
  fontWeight: 900,
  lineHeight: 1.12,
  letterSpacing: "-0.025em",
  [theme.breakpoints.up("md")]: {
    maxWidth: "24ch",
  },
}));

export const HelpTopicDescription = styled("span")(({ theme }) => ({
  maxWidth: "52rem",
  color: theme.trucoshiUi.seo.textSecondary,
  lineHeight: 1.65,
}));

export const HelpTopicContent = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  padding: theme.spacing(1, 0, 5),
  color: theme.trucoshiUi.seo.textPrimary,
  "& .MuiList-root": {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    padding: 0,
    borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  "& .MuiListItemButton-root, & .MuiListItem-root": {
    minHeight: "4.5rem",
    borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  },
  "& .MuiListItemButton-root": {
    transition: "background-color 180ms ease, color 180ms ease",
    "&:hover": {
      color: theme.trucoshiUi.seo.accent,
      backgroundColor: theme.trucoshiUi.seo.navigationSurface,
    },
  },
  "& .MuiListItemIcon-root": {
    minWidth: theme.spacing(5),
    color: theme.trucoshiUi.seo.accent,
  },
  "& .MuiListItemText-secondary": {
    color: theme.trucoshiUi.seo.textSecondary,
  },
  "& > .MuiStack-root": {
    paddingTop: 0,
  },
}));

export const HelpCredit = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  color: theme.trucoshiUi.seo.textSecondary,
  fontSize: "0.72rem",
  letterSpacing: "0.04em",
}));

export const HelpCreditLink = styled(Link)(({ theme }) => ({
  color: theme.trucoshiUi.seo.textPrimary,
  fontWeight: 850,
  textDecorationColor: theme.trucoshiUi.seo.accent,
}));
