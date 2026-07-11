import { Box, Button, Typography } from "@mui/material";
import { keyframes, styled } from "@mui/material/styles";
import { Link as RouterLink } from "@tanstack/react-router";

const copyEntrance = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const cardEntrance = keyframes`
  from { opacity: 0; transform: translateY(34px) rotate(var(--card-rotation)) scale(0.94); }
  to { opacity: 1; transform: translateY(0) rotate(var(--card-rotation)) scale(1); }
`;

const sealEntrance = keyframes`
  from { opacity: 0; transform: translate(-50%, -44%) scale(0.84); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const SeoPageRoot = styled(Box)(({ theme }) => ({
  color: theme.trucoshiUi.seo.textPrimary,
  backgroundColor: theme.trucoshiUi.seo.canvas,
  overflow: "hidden",
  "@media (prefers-reduced-motion: reduce)": {
    "&, & *": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      scrollBehavior: "auto !important",
      transitionDuration: "0.01ms !important",
    },
  },
}));

export const SeoContentWidth = styled(Box)(({ theme }) => ({
  width: "min(100%, 76rem)",
  marginInline: "auto",
  paddingInline: theme.spacing(2.5),
  [theme.breakpoints.up("sm")]: {
    paddingInline: theme.spacing(4),
  },
  [theme.breakpoints.up("lg")]: {
    paddingInline: theme.spacing(5),
  },
}));

export const HeroSection = styled("header")(({ theme }) => ({
  position: "relative",
  isolation: "isolate",
  minHeight: "min(42rem, calc(100svh - 3.1rem))",
  overflow: "hidden",
  background: theme.trucoshiUi.seo.heroBackground,
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
}));

export const HeroTexture = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  zIndex: -1,
  opacity: 0.26,
  backgroundImage: theme.trucoshiUi.seo.heroOverlay,
  backgroundSize: "36px 36px",
  maskImage: "linear-gradient(to bottom, black, transparent 92%)",
}));

export const HeroTopline = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "4.6rem",
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
}));

export const BackAction = styled(Button)(({ theme }) => ({
  color: theme.trucoshiUi.seo.textSecondary,
  minWidth: 0,
  paddingInline: 0,
  fontSize: "0.73rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
  "&:hover": {
    color: theme.trucoshiUi.seo.textPrimary,
    backgroundColor: "transparent",
    transform: "translateX(-0.18rem)",
  },
}));

export const HeroIndex = styled("p")(({ theme }) => ({
  margin: 0,
  color: theme.trucoshiUi.seo.textSecondary,
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
}));

export const HeroGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  alignItems: "center",
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(5, 7),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(20rem, 0.95fr)",
    gap: theme.spacing(5),
    minHeight: "34rem",
    paddingBlock: theme.spacing(5, 8),
  },
}));

export const HeroCopy = styled(Box)(() => ({
  position: "relative",
  zIndex: 2,
  animation: `${copyEntrance} 620ms cubic-bezier(0.22, 1, 0.36, 1) both`,
}));

export const Eyebrow = styled("p")(({ theme }) => ({
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.2),
  color: theme.trucoshiUi.seo.accent,
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  "&::before": {
    content: '""',
    width: "2.4rem",
    height: 2,
    backgroundColor: "currentColor",
  },
}));

export const HeroTitle = styled("h1")(({ theme }) => ({
  maxWidth: "12.5ch",
  margin: theme.spacing(2, 0, 0),
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(2.75rem, 8.8vw, 5.35rem)",
  fontWeight: 950,
  lineHeight: 0.98,
  letterSpacing: "-0.052em",
  textWrap: "balance",
}));

export const HeroLead = styled(Typography)(({ theme }) => ({
  maxWidth: "35rem",
  marginTop: theme.spacing(3),
  color: theme.trucoshiUi.seo.textSecondary,
  fontSize: "clamp(1rem, 2vw, 1.18rem)",
  lineHeight: 1.65,
}));

export const HeroActions = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(1.25),
  marginTop: theme.spacing(3.5),
}));

export const PrimaryAction = styled(RouterLink)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  minHeight: "3rem",
  paddingInline: theme.spacing(2.5),
  borderRadius: 0,
  color: "#180b06",
  backgroundColor: theme.trucoshiUi.seo.accent,
  fontWeight: 950,
  letterSpacing: "0.035em",
  boxShadow: "none",
  textDecoration: "none",
  textTransform: "uppercase",
  transition: "background-color 180ms ease, transform 180ms ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    boxShadow: "none",
    transform: "translateY(-2px)",
  },
}));

export const SecondaryAction = styled(RouterLink)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  minHeight: "3rem",
  paddingInline: theme.spacing(2),
  borderRadius: 0,
  color: theme.trucoshiUi.seo.textPrimary,
  border: "1px solid",
  borderColor: theme.trucoshiUi.seo.divider,
  fontWeight: 850,
  textDecoration: "none",
  transition: "border-color 180ms ease, background-color 180ms ease",
  "&:hover": {
    borderColor: theme.trucoshiUi.seo.textSecondary,
    backgroundColor: theme.trucoshiUi.seo.navigationSurface,
  },
}));

export const HeroVisual = styled(Box)(({ theme }) => ({
  position: "relative",
  minHeight: "20.5rem",
  [theme.breakpoints.up("md")]: {
    minHeight: "31rem",
  },
}));

export const CardFan = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: "50% auto auto 50%",
  width: "min(27rem, 88vw)",
  height: "min(28rem, 82vw)",
  transform: "translate(-50%, -50%)",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "14% 3% 4%",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(236,108,52,0.16), rgba(42,117,85,0.11) 42%, transparent 70%)",
    filter: "blur(5px)",
  },
  "& [data-card-position]": {
    position: "absolute",
    bottom: "10%",
    left: "50%",
    width: "35%",
    height: "auto",
    borderRadius: "6.5%",
    transformOrigin: "50% 112%",
    boxShadow: theme.trucoshiUi.seo.cardShadow,
    animation: `${cardEntrance} 720ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  },
  "& [data-card-position='left']": {
    "--card-rotation": "-16deg",
    marginLeft: "-25%",
    animationDelay: "120ms",
  },
  "& [data-card-position='center']": {
    "--card-rotation": "0deg",
    zIndex: 2,
    marginLeft: "-17.5%",
    bottom: "15%",
    animationDelay: "40ms",
  },
  "& [data-card-position='right']": {
    "--card-rotation": "16deg",
    zIndex: 1,
    marginLeft: "-10%",
    animationDelay: "200ms",
  },
  [theme.breakpoints.down("md")]: {
    top: "47%",
    width: "min(22rem, 82vw)",
    height: "min(21rem, 78vw)",
    "& [data-card-position]": {
      width: "32%",
    },
  },
}));

export const HeroCardImage = styled("img")({
  display: "block",
  userSelect: "none",
});

export const HeroSeal = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "16%",
  left: "50%",
  zIndex: 4,
  display: "grid",
  placeItems: "center",
  width: "5.2rem",
  aspectRatio: "1",
  transform: "translate(-50%, -50%)",
  border: `1px solid ${theme.trucoshiUi.seo.divider}`,
  borderRadius: "50%",
  backgroundColor: "rgba(7, 18, 12, 0.9)",
  boxShadow: "0 14px 32px rgba(0,0,0,0.4)",
  animation: `${sealEntrance} 540ms 360ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  "& img": {
    width: "58%",
    height: "58%",
    objectFit: "contain",
  },
  [theme.breakpoints.down("md")]: {
    top: "45%",
    width: "4.4rem",
  },
}));

export const HeroVisualCaption = styled(Typography)(({ theme }) => ({
  position: "absolute",
  right: 0,
  bottom: theme.spacing(1),
  color: theme.trucoshiUi.seo.textSecondary,
  fontSize: "0.65rem",
  fontWeight: 850,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  [theme.breakpoints.down("md")]: {
    right: "50%",
    bottom: 0,
    width: "max-content",
    transform: "translateX(50%)",
  },
}));

export const NavigationSection = styled("nav")(({ theme }) => ({
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  backgroundColor: theme.trucoshiUi.seo.contentSurface,
}));

export const NavigationInner = styled(SeoContentWidth)(({ theme }) => ({
  display: "grid",
  alignItems: "center",
  gap: theme.spacing(1.5),
  paddingBlock: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "12rem minmax(0, 1fr)",
  },
}));

export const NavigationLabel = styled(Typography)(({ theme }) => ({
  color: theme.trucoshiUi.seo.textSecondary,
  fontSize: "0.68rem",
  fontWeight: 850,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
}));

export const NavigationLinks = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5, 2.5),
}));

export const NavigationLink = styled(RouterLink)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.7),
  minWidth: 0,
  paddingBlock: theme.spacing(0.5),
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "0.82rem",
  fontWeight: 850,
  textDecoration: "none",
  "& .seo-link-icon": {
    fontSize: "1rem",
    transition: "transform 180ms ease",
  },
  "&:hover": {
    color: theme.trucoshiUi.seo.accent,
    "& .seo-link-icon": {
      transform: "translateX(0.22rem)",
    },
  },
}));

export const EditorialMain = styled("div")(({ theme }) => ({
  backgroundColor: theme.trucoshiUi.seo.canvas,
  paddingBlock: theme.spacing(7, 9),
  [theme.breakpoints.up("md")]: {
    paddingBlock: theme.spacing(10, 12),
  },
}));

export const EditorialIntro = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(5),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(10rem, 0.34fr) minmax(0, 0.66fr)",
    alignItems: "start",
    marginBottom: theme.spacing(8),
  },
}));

export const EditorialHeading = styled("h2")(({ theme }) => ({
  maxWidth: "18ch",
  margin: 0,
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
  fontWeight: 930,
  lineHeight: 1.04,
  letterSpacing: "-0.04em",
  textWrap: "balance",
}));

export const EditorialDeck = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
}));

export const EditorialSection = styled("section")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "3rem minmax(0, 1fr)",
  gap: theme.spacing(1.5),
  paddingBlock: theme.spacing(3.5),
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "5rem minmax(13rem, 0.52fr) minmax(0, 0.48fr)",
    alignItems: "baseline",
    gap: theme.spacing(3),
    paddingBlock: theme.spacing(4.5),
  },
}));

export const EditorialNumber = styled(Typography)(({ theme }) => ({
  color: theme.trucoshiUi.seo.accent,
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.12em",
}));

export const EditorialSectionTitle = styled("h2")(({ theme }) => ({
  margin: 0,
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(1.35rem, 3vw, 2.05rem)",
  fontWeight: 900,
  lineHeight: 1.15,
  letterSpacing: "-0.025em",
}));

export const EditorialSectionBody = styled(Typography)(({ theme }) => ({
  gridColumn: "2 / -1",
  color: theme.trucoshiUi.seo.textSecondary,
  fontSize: "1rem",
  lineHeight: 1.75,
  [theme.breakpoints.up("md")]: {
    gridColumn: "auto",
  },
}));

export const FeatureSection = styled("section")(({ theme }) => ({
  marginTop: theme.spacing(8),
  paddingTop: theme.spacing(5),
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
  "& > *": {
    color: theme.trucoshiUi.seo.textPrimary,
  },
}));

export const SeoRulebookArticle = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(5),
  [theme.breakpoints.up("md")]: {
    gap: theme.spacing(7),
  },
}));

export const SeoRulebookMarkdown = styled(Box)(({ theme }) => ({
  textAlign: "left",
  "& > :first-child": {
    marginTop: 0,
  },
  "& > :last-child": {
    marginBottom: 0,
  },
  "& h2": {
    maxWidth: "22ch",
    margin: theme.spacing(6, 0, 2),
    paddingTop: theme.spacing(3),
    borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
    color: theme.trucoshiUi.seo.textPrimary,
    fontSize: "clamp(1.65rem, 3vw, 2.65rem)",
    fontWeight: 920,
    lineHeight: 1.08,
    letterSpacing: "-0.035em",
  },
  "& p, & li": {
    maxWidth: "52rem",
    color: theme.trucoshiUi.seo.textSecondary,
    fontSize: "1rem",
    lineHeight: 1.78,
  },
  "& ul, & ol": {
    marginBlock: theme.spacing(2.5),
    paddingLeft: theme.spacing(3),
  },
  "& li": {
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(0.7),
    "&::marker": {
      color: theme.trucoshiUi.seo.accent,
      fontWeight: 900,
    },
  },
  "& code": {
    paddingInline: theme.spacing(0.5),
    color: theme.trucoshiUi.seo.textPrimary,
    backgroundColor: theme.trucoshiUi.seo.navigationSurface,
  },
}));

export const SeoRulebookRanking = styled(Box)(({ theme }) => ({
  marginInline: `calc(${theme.spacing(2.5)} * -1)`,
  padding: theme.spacing(4, 2.5),
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  background: `linear-gradient(110deg, ${theme.trucoshiUi.seo.accentSoft}, transparent 52%)`,
  [theme.breakpoints.up("sm")]: {
    marginInline: 0,
    padding: theme.spacing(5),
  },
}));

export const FaqSection = styled("section")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(4),
  marginTop: theme.spacing(9),
  paddingTop: theme.spacing(6),
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(12rem, 0.36fr) minmax(0, 0.64fr)",
    gap: theme.spacing(7),
  },
}));

export const FaqHeading = styled("h2")(({ theme }) => ({
  maxWidth: "10ch",
  margin: theme.spacing(1.5, 0, 0),
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(2rem, 4vw, 3.2rem)",
  fontWeight: 920,
  lineHeight: 1.03,
  letterSpacing: "-0.04em",
}));

export const FaqList = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
}));

export const FaqItemRoot = styled("details")(({ theme }) => ({
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  "&[open] summary::after": {
    content: '"−"',
    color: theme.trucoshiUi.seo.accent,
  },
}));

export const FaqQuestion = styled("summary")(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(2.5, 3.5, 2.5, 0),
  color: theme.trucoshiUi.seo.textPrimary,
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: 850,
  listStyle: "none",
  "&::-webkit-details-marker": {
    display: "none",
  },
  "&::after": {
    content: '"+"',
    position: "absolute",
    right: 0,
    color: theme.trucoshiUi.seo.textSecondary,
    fontSize: "1.25rem",
    fontWeight: 500,
  },
}));

export const FaqAnswer = styled(Typography)(({ theme }) => ({
  maxWidth: "42rem",
  padding: theme.spacing(0, 4, 2.75, 0),
  color: theme.trucoshiUi.seo.textSecondary,
  lineHeight: 1.7,
}));

export const FinalCta = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "column",
  gap: theme.spacing(3),
  marginTop: theme.spacing(9),
  padding: theme.spacing(5),
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  background:
    "linear-gradient(90deg, rgba(236,108,52,0.1), transparent 42%, rgba(255,255,255,0.025))",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

export const FinalCtaTitle = styled("h2")(({ theme }) => ({
  maxWidth: "18ch",
  margin: theme.spacing(1, 0, 0),
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(1.65rem, 3vw, 2.55rem)",
  fontWeight: 920,
  lineHeight: 1.08,
  letterSpacing: "-0.035em",
}));

export const HomeDiscoveryRoot = styled("section")(({ theme }) => ({
  position: "relative",
  marginTop: theme.spacing(3),
  overflow: "hidden",
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  color: theme.trucoshiUi.seo.textPrimary,
  background: theme.trucoshiUi.shell.featureBackground,
}));

export const HomeDiscoveryInner = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(4),
  padding: theme.spacing(4, 2.5),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(5),
  },
}));

export const HomeDiscoveryTitle = styled("h1")(({ theme }) => ({
  maxWidth: "17ch",
  margin: theme.spacing(1.5, 0, 0),
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "clamp(1.8rem, 4vw, 3.3rem)",
  fontWeight: 930,
  lineHeight: 1.02,
  letterSpacing: "-0.043em",
}));

export const HomeDiscoveryLead = styled(Typography)(({ theme }) => ({
  maxWidth: "32rem",
  marginTop: theme.spacing(2),
  color: theme.trucoshiUi.seo.textSecondary,
  lineHeight: 1.65,
}));

export const HomeDiscoveryLinks = styled("nav")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  borderTop: `1px solid ${theme.trucoshiUi.seo.divider}`,
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
}));

export const HomeDiscoveryLink = styled(RouterLink)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "4.35rem",
  paddingInline: theme.spacing(1.5),
  borderRadius: 0,
  borderBottom: `1px solid ${theme.trucoshiUi.seo.divider}`,
  color: theme.trucoshiUi.seo.textPrimary,
  fontSize: "0.8rem",
  fontWeight: 850,
  letterSpacing: "0.035em",
  textAlign: "left",
  textDecoration: "none",
  "& .seo-link-icon": {
    color: theme.trucoshiUi.seo.accent,
    fontSize: "1.1rem",
    transition: "transform 180ms ease",
  },
  "&:hover": {
    backgroundColor: theme.trucoshiUi.seo.navigationSurface,
    "& .seo-link-icon": {
      transform: "translateX(0.25rem)",
    },
  },
  [theme.breakpoints.up("sm")]: {
    "&:nth-of-type(odd)": {
      borderRight: `1px solid ${theme.trucoshiUi.seo.divider}`,
    },
  },
}));
