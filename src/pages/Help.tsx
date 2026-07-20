import {
  ArrowForwardRounded,
  BoltRounded,
  MenuBookRounded,
  TranslateRounded,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { BitcoinHelp } from "../components/help/BitcoinHelp";
import {
  GuidePageShell,
  GuideSection,
  GuideSectionLead,
  GuideSectionTitle,
} from "../components/help/GuidePageShell";
import { TrucoHelp } from "../components/help/TrucoHelp";

const HelpDirectory = styled(Box)(({ theme }) => ({
  display: "grid",
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
}));

const HelpDirectoryLink = styled(RouterLink)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "2.5rem minmax(0, 1fr) auto",
  gap: theme.spacing(1.5),
  alignItems: "center",
  minHeight: "6.2rem",
  padding: theme.spacing(1.5, 0),
  color: theme.palette.text.primary,
  textDecoration: "none",
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
  transition: theme.transitions.create(["color", "padding"], {
    duration: theme.transitions.duration.short,
  }),
  "& > .MuiSvgIcon-root:first-of-type": {
    color: theme.palette.primary.main,
  },
  "& > .MuiSvgIcon-root:last-of-type": {
    color: alpha(theme.palette.text.primary, 0.52),
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.short,
    }),
  },
  "&:hover, &:focus-visible": {
    color: theme.palette.primary.main,
    paddingLeft: theme.spacing(1),
    "& > .MuiSvgIcon-root:last-of-type": {
      transform: "translateX(4px)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "& > .MuiSvgIcon-root:last-of-type": {
      transition: "none",
    },
  },
}));

const HelpLinkTitle = styled(Typography)({
  fontWeight: 850,
  lineHeight: 1.25,
});

const HelpLinkDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.35),
  color: alpha(theme.palette.text.primary, 0.64),
  fontSize: "0.86rem",
  lineHeight: 1.45,
}));

const HelpTopics = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
}));

const HelpTopic = styled("details")(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
  "&[open] > summary::after": {
    content: '"−"',
    color: theme.palette.primary.main,
  },
}));

const HelpTopicSummary = styled("summary")(({ theme }) => ({
  position: "relative",
  display: "grid",
  gap: theme.spacing(0.65),
  padding: theme.spacing(3, 5, 3, 0),
  color: theme.palette.text.primary,
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
    color: alpha(theme.palette.text.primary, 0.55),
    fontSize: "1.35rem",
    fontWeight: 500,
  },
}));

const HelpTopicKicker = styled("span")(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "0.68rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
}));

const HelpTopicTitle = styled("span")({
  fontSize: "clamp(1.3rem, 2.6vw, 2rem)",
  fontWeight: 900,
  lineHeight: 1.12,
  letterSpacing: "-0.03em",
});

const HelpTopicDescription = styled("span")(({ theme }) => ({
  maxWidth: "54rem",
  color: alpha(theme.palette.text.primary, 0.64),
  lineHeight: 1.6,
}));

const HelpTopicContent = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  padding: theme.spacing(0, 0, 5),
  color: theme.palette.text.primary,
  "& .MuiList-root": {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    padding: 0,
    borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.13)}`,
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  "& .MuiListItemButton-root, & .MuiListItem-root": {
    minHeight: "4.5rem",
    background: "transparent",
    borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.13)}`,
  },
  "& .MuiListItemButton-root": {
    transition: theme.transitions.create(["background-color", "color"], {
      duration: theme.transitions.duration.shorter,
    }),
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.07),
    },
  },
  "& .MuiListItemIcon-root": {
    minWidth: theme.spacing(5),
    color: theme.palette.primary.main,
  },
  "& .MuiListItemText-secondary": {
    color: alpha(theme.palette.text.primary, 0.6),
  },
}));

export function Help() {
  return (
    <GuidePageShell
      eyebrow="Reglas, cartas y soporte"
      title="Todo para jugar una buena mano"
      intro="Aprendé las reglas, compará el ranking de cartas y resolvé tus dudas sin salir de Trucoshi."
      backLabel="Volver al inicio"
      backTo="/"
      actions={[
        { label: "Leer las reglas", to: "/rules", primary: true },
        { label: "Rules in English", to: "/rules/en" },
      ]}
      cardCodes={["3c", "1e", "7o"]}
      visualCaption="Guías para la mesa"
    >
      <GuideSection>
        <GuideSectionTitle>Empezá por acá</GuideSectionTitle>
        <Box>
          <GuideSectionLead>
            Elegí una guía. El reglamento incluye equipos, bazas, envido,
            flor, truco y pica-pica.
          </GuideSectionLead>
          <HelpDirectory aria-label="Guías de Truco">
            <HelpDirectoryLink to="/rules">
              <MenuBookRounded />
              <Box>
                <HelpLinkTitle>Reglas del Truco</HelpLinkTitle>
                <HelpLinkDescription>
                  Reglamento completo en español y ranking visual de cartas.
                </HelpLinkDescription>
              </Box>
              <ArrowForwardRounded />
            </HelpDirectoryLink>
            <HelpDirectoryLink to="/rules/en">
              <TranslateRounded />
              <Box>
                <HelpLinkTitle>Rules in English</HelpLinkTitle>
                <HelpLinkDescription>
                  The same complete guide, written in English.
                </HelpLinkDescription>
              </Box>
              <ArrowForwardRounded />
            </HelpDirectoryLink>
            <HelpDirectoryLink to="#bitcoin-lightning">
              <BoltRounded />
              <Box>
                <HelpLinkTitle>Bitcoin y Lightning</HelpLinkTitle>
                <HelpLinkDescription>
                  Una introducción simple a los pagos instantáneos.
                </HelpLinkDescription>
              </Box>
              <ArrowForwardRounded />
            </HelpDirectoryLink>
          </HelpDirectory>
        </Box>
      </GuideSection>

      <GuideSection>
        <GuideSectionTitle>Guías y recursos</GuideSectionTitle>
        <HelpTopics>
          <HelpTopic open>
            <HelpTopicSummary>
              <HelpTopicKicker>Mesa y cartas</HelpTopicKicker>
              <HelpTopicTitle>Truco argentino</HelpTopicTitle>
              <HelpTopicDescription>
                Recursos de la comunidad y el orden completo de las cartas.
              </HelpTopicDescription>
            </HelpTopicSummary>
            <HelpTopicContent>
              <TrucoHelp />
            </HelpTopicContent>
          </HelpTopic>

          <HelpTopic id="bitcoin-lightning">
            <HelpTopicSummary>
              <HelpTopicKicker>Pagos instantáneos</HelpTopicKicker>
              <HelpTopicTitle>Bitcoin y Lightning Network</HelpTopicTitle>
              <HelpTopicDescription>
                Conceptos básicos explicados de manera directa.
              </HelpTopicDescription>
            </HelpTopicSummary>
            <HelpTopicContent>
              <BitcoinHelp />
            </HelpTopicContent>
          </HelpTopic>
        </HelpTopics>
      </GuideSection>
    </GuidePageShell>
  );
}
