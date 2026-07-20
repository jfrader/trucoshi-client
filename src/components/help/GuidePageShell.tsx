import {
  ArrowBackRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { Box, Container, Stack, Typography } from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router-dom";

const liftIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const dealIn = keyframes`
  from {
    opacity: 0;
    transform: translate3d(12%, 18%, 0) scale(.92);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const GuideRoot = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2, 0, 8),
  textAlign: "left",
  color: theme.palette.text.primary,
  [theme.breakpoints.up("md")]: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(11),
  },
}));

const GuideHero = styled("header")(({ theme }) => ({
  position: "relative",
  isolation: "isolate",
  display: "grid",
  minHeight: "min(34rem, calc(100svh - 9rem))",
  overflow: "hidden",
  borderRadius: "1.75rem",
  background: [
    `radial-gradient(circle at 82% 18%, ${alpha(theme.palette.primary.main, 0.24)}, transparent 30%)`,
    `radial-gradient(circle at 12% 8%, ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.48)}, transparent 32%)`,
    `linear-gradient(145deg, ${alpha(theme.palette.success.dark, theme.palette.mode === "dark" ? 0.56 : 0.3)}, transparent 62%)`,
    theme.palette.background.paper,
  ].join(", "),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: `0 1.5rem 4rem ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.32 : 0.12)}`,
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(19rem, .9fr)",
    minHeight: "31rem",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    zIndex: -1,
    opacity: theme.palette.mode === "dark" ? 0.2 : 0.12,
    backgroundImage:
      "repeating-linear-gradient(115deg, transparent 0, transparent 7px, rgba(255,255,255,.12) 8px, transparent 9px)",
    pointerEvents: "none",
  },
}));

const HeroCopy = styled(Box)(({ theme }) => ({
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: theme.spacing(3),
  animation: `${liftIn} 520ms ${theme.transitions.easing.easeOut} both`,
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(5),
  },
  [theme.breakpoints.up("lg")]: {
    padding: theme.spacing(6),
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
}));

const BackLink = styled(RouterLink)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  alignSelf: "flex-start",
  minWidth: 0,
  marginBottom: theme.spacing(4),
  padding: 0,
  color: theme.palette.text.secondary,
  fontSize: "0.76rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textDecoration: "none",
  textTransform: "uppercase",
  "&:hover": {
    color: theme.palette.primary.main,
    background: "transparent",
    "& .MuiSvgIcon-root": {
      transform: "translateX(-3px)",
    },
  },
  "& .MuiSvgIcon-root": {
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

const Eyebrow = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  color: theme.palette.primary.main,
  fontSize: "0.72rem",
  fontWeight: 900,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
}));

const HeroTitle = styled("h1")(({ theme }) => ({
  maxWidth: "13ch",
  margin: 0,
  color: theme.palette.text.primary,
  fontSize: "clamp(2.55rem, 8vw, 5.35rem)",
  fontWeight: 900,
  lineHeight: 0.94,
  letterSpacing: "-0.065em",
  textWrap: "balance",
}));

const HeroIntro = styled(Typography)(({ theme }) => ({
  maxWidth: "42rem",
  marginTop: theme.spacing(2.5),
  color: alpha(theme.palette.text.primary, 0.76),
  fontSize: "clamp(1rem, 1.4vw, 1.16rem)",
  lineHeight: 1.7,
}));

const HeroActions = styled(Stack)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3.5),
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const HeroAction = styled(RouterLink, {
  shouldForwardProp: (prop) => prop !== "primaryaction",
})<{ primaryaction?: boolean }>(({ theme, primaryaction }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  minHeight: "2.85rem",
  borderRadius: "999px",
  paddingInline: theme.spacing(2.4),
  color: primaryaction
    ? theme.palette.primary.contrastText
    : theme.palette.primary.main,
  backgroundColor: primaryaction ? theme.palette.primary.main : "transparent",
  border: `1px solid ${theme.palette.primary.main}`,
  fontWeight: 850,
  textDecoration: "none",
  textTransform: "none",
  transition: theme.transitions.create(["background-color", "color", "transform"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover, &:focus-visible": {
    color: primaryaction
      ? theme.palette.primary.contrastText
      : theme.palette.primary.main,
    backgroundColor: primaryaction
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.main, 0.08),
    transform: "translateY(-2px)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
}));

const HeroVisual = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "grid",
  minHeight: "15rem",
  placeItems: "center",
  overflow: "hidden",
  background: `linear-gradient(180deg, transparent, ${alpha(theme.palette.common.black, 0.12)})`,
  [theme.breakpoints.up("md")]: {
    minHeight: "100%",
  },
}));

const CardFan = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "min(78vw, 22rem)",
  height: "15.5rem",
  animation: `${dealIn} 680ms 120ms ${theme.transitions.easing.easeOut} both`,
  [theme.breakpoints.up("md")]: {
    width: "22rem",
    height: "22rem",
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
}));

const HeroCard = styled("img")(({ theme }) => ({
  position: "absolute",
  left: "50%",
  bottom: "-1rem",
  width: "clamp(7.2rem, 29vw, 10.25rem)",
  height: "auto",
  transformOrigin: "50% 115%",
  filter: `drop-shadow(0 1rem 1.15rem ${alpha(theme.palette.common.black, 0.42)})`,
  transition: theme.transitions.create(["transform", "filter"], {
    duration: theme.transitions.duration.standard,
  }),
  "&:nth-of-type(1)": {
    transform: "translateX(-112%) rotate(-13deg)",
  },
  "&:nth-of-type(2)": {
    zIndex: 2,
    transform: "translateX(-50%) translateY(-1.2rem)",
  },
  "&:nth-of-type(3)": {
    transform: "translateX(12%) rotate(13deg)",
  },
  [`${CardFan}:hover &:nth-of-type(1)`]: {
    transform: "translateX(-118%) rotate(-16deg) translateY(-.35rem)",
  },
  [`${CardFan}:hover &:nth-of-type(2)`]: {
    transform: "translateX(-50%) translateY(-1.8rem)",
  },
  [`${CardFan}:hover &:nth-of-type(3)`]: {
    transform: "translateX(18%) rotate(16deg) translateY(-.35rem)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
}));

const VisualCaption = styled(Typography)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(2.5),
  bottom: theme.spacing(2),
  color: alpha(theme.palette.text.primary, 0.62),
  fontSize: "0.66rem",
  fontWeight: 800,
  letterSpacing: "0.13em",
  textTransform: "uppercase",
}));

export const GuideContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 1, 0),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(9, 2, 0),
  },
}));

export const GuideSection = styled("section")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  paddingBlock: theme.spacing(4),
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.13)}`,
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(12rem, .58fr) minmax(0, 1.42fr)",
    gap: theme.spacing(8),
    paddingBlock: theme.spacing(6),
  },
}));

export const GuideSectionTitle = styled("h2")(({ theme }) => ({
  margin: 0,
  color: theme.palette.text.primary,
  fontSize: "clamp(1.65rem, 3.3vw, 2.7rem)",
  fontWeight: 900,
  lineHeight: 1.03,
  letterSpacing: "-0.045em",
  textWrap: "balance",
}));

export const GuideSectionLead = styled(Typography)(({ theme }) => ({
  maxWidth: "58rem",
  color: alpha(theme.palette.text.primary, 0.7),
  fontSize: "1rem",
  lineHeight: 1.75,
}));

export type GuidePageAction = {
  label: string;
  to: string;
  primary?: boolean;
};

type GuidePageShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  intro: string;
  backLabel: string;
  backTo: string;
  actions?: GuidePageAction[];
  cardCodes?: [string, string, string];
  visualCaption?: string;
}>;

const defaultCards: [string, string, string] = ["7e", "1e", "1b"];

export function GuidePageShell({
  eyebrow,
  title,
  intro,
  backLabel,
  backTo,
  actions = [],
  cardCodes = defaultCards,
  visualCaption = "2 · 4 · 6 jugadores",
  children,
}: GuidePageShellProps) {
  return (
    <GuideRoot>
      <Container maxWidth="lg" disableGutters>
        <GuideHero>
          <HeroCopy>
            <BackLink to={backTo}>
              <ArrowBackRounded fontSize="small" />
              {backLabel}
            </BackLink>
            <Eyebrow>{eyebrow}</Eyebrow>
            <HeroTitle>{title}</HeroTitle>
            <HeroIntro>{intro}</HeroIntro>
            {actions.length ? (
              <HeroActions direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                {actions.map((action) => (
                  <HeroAction
                    to={action.to}
                    key={action.to}
                    primaryaction={action.primary}
                  >
                    {action.label}
                    <ArrowForwardRounded fontSize="small" />
                  </HeroAction>
                ))}
              </HeroActions>
            ) : null}
          </HeroCopy>
          <HeroVisual aria-hidden="true">
            <CardFan>
              {cardCodes.map((cardCode) => (
                <HeroCard
                  alt=""
                  draggable={false}
                  key={cardCode}
                  src={`/cards/default/${cardCode}.png`}
                />
              ))}
            </CardFan>
            <VisualCaption>{visualCaption}</VisualCaption>
          </HeroVisual>
        </GuideHero>
        <GuideContent>{children}</GuideContent>
      </Container>
    </GuideRoot>
  );
}
