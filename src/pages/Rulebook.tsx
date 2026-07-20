import { ArrowDownwardRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import {
  GuidePageShell,
  GuideSection,
  GuideSectionLead,
  GuideSectionTitle,
} from "../components/help/GuidePageShell";
import {
  getRuleHeadings,
  RuleMarkdown,
} from "../components/help/RuleMarkdown";
import englishRules from "../content/rules/truco.en.md?raw";
import spanishRules from "../content/rules/truco.es.md?raw";

export type RulebookLanguage = "es" | "en";

const rulebookByLanguage = {
  es: {
    markdown: spanishRules,
    eyebrow: "Truco argentino",
    title: "Reglas del Truco",
    intro:
      "Una guía clara para entender la mesa, el valor de las cartas y cada canto antes de jugar.",
    backLabel: "Volver a ayuda",
    rankingTitle: "Ranking visual de cartas",
    contentsLabel: "En esta guía",
    rulesLabel: "Reglamento completo",
    rulesLead:
      "Leé de corrido o usá el índice para saltar a una parte de la mano.",
    actions: [
      { label: "Read in English", to: "/rules/en", primary: true },
      { label: "Ir a ayuda", to: "/help" },
    ],
    facts: [
      ["3", "cartas por jugador"],
      ["2", "equipos por mesa"],
      ["3", "bazas como máximo"],
    ],
    visualCaption: "Baraja española · 40 cartas",
  },
  en: {
    markdown: englishRules,
    eyebrow: "Argentinian Truco",
    title: "How to play Truco",
    intro:
      "A practical guide to the table, card strength, scoring, and every call you can make.",
    backLabel: "Back to help",
    rankingTitle: "Visual card ranking",
    contentsLabel: "In this guide",
    rulesLabel: "Complete rules",
    rulesLead:
      "Read from the top or use the index to jump to a specific part of the hand.",
    actions: [
      { label: "Leer en español", to: "/rules", primary: true },
      { label: "Open help", to: "/help" },
    ],
    facts: [
      ["3", "cards per player"],
      ["2", "teams at the table"],
      ["3", "tricks at most"],
    ],
    visualCaption: "Spanish deck · 40 cards",
  },
} as const;

const RulePrimer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  margin: 0,
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
}));

const RuleFact = styled(Box)(({ theme }) => ({
  minWidth: 0,
  padding: theme.spacing(2.5, 1),
  borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
  "&:first-of-type": {
    paddingLeft: 0,
    borderLeft: 0,
  },
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3.5, 3),
  },
}));

const RuleFactValue = styled("dt")(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "clamp(1.85rem, 5vw, 3.6rem)",
  fontWeight: 950,
  lineHeight: 1,
  letterSpacing: "-0.06em",
}));

const RuleFactLabel = styled("dd")(({ theme }) => ({
  margin: theme.spacing(0.7, 0, 0),
  color: alpha(theme.palette.text.primary, 0.68),
  fontSize: "clamp(.7rem, 1.4vw, .9rem)",
  lineHeight: 1.35,
}));

const RulebookGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(5),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "12.5rem minmax(0, 1fr)",
    gap: theme.spacing(8),
    alignItems: "start",
  },
}));

const RuleIndex = styled("nav")(({ theme }) => ({
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
  [theme.breakpoints.up("md")]: {
    position: "sticky",
    top: "6rem",
    paddingBottom: 0,
    borderBottom: 0,
  },
}));

const RuleIndexLabel = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  marginBottom: theme.spacing(1.5),
  color: theme.palette.primary.main,
  fontSize: "0.67rem",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
}));

const RuleIndexList = styled("ol")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.7, 1.4),
  margin: 0,
  padding: 0,
  listStyle: "none",
  [theme.breakpoints.up("md")]: {
    display: "grid",
    gap: theme.spacing(0.35),
  },
}));

const RuleIndexLink = styled(RouterLink)(({ theme }) => ({
  display: "inline-flex",
  paddingBlock: theme.spacing(0.55),
  color: alpha(theme.palette.text.primary, 0.65),
  fontSize: "0.82rem",
  lineHeight: 1.35,
  textDecoration: "none",
  transition: theme.transitions.create(["color", "transform"], {
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover, &:focus-visible": {
    color: theme.palette.primary.main,
    transform: "translateX(3px)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
}));

export function Rulebook({ language = "es" }: { language?: RulebookLanguage }) {
  const copy = rulebookByLanguage[language];
  const headings = getRuleHeadings(copy.markdown);

  return (
    <GuidePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
      backLabel={copy.backLabel}
      backTo="/help"
      actions={[...copy.actions]}
      visualCaption={copy.visualCaption}
    >
      <RulePrimer component="dl" aria-label={copy.contentsLabel}>
        {copy.facts.map(([value, label]) => (
          <RuleFact key={label}>
            <RuleFactValue>{value}</RuleFactValue>
            <RuleFactLabel>{label}</RuleFactLabel>
          </RuleFact>
        ))}
      </RulePrimer>

      <GuideSection>
        <Box>
          <GuideSectionTitle>{copy.rulesLabel}</GuideSectionTitle>
        </Box>
        <GuideSectionLead>{copy.rulesLead}</GuideSectionLead>
      </GuideSection>

      <RulebookGrid component="article" lang={language}>
        <RuleIndex aria-label={copy.contentsLabel}>
          <RuleIndexLabel>
            <ArrowDownwardRounded fontSize="inherit" />
            {copy.contentsLabel}
          </RuleIndexLabel>
          <RuleIndexList>
            {headings.map((heading) => (
              <li key={heading.id}>
                <RuleIndexLink to={`#${heading.id}`}>{heading.text}</RuleIndexLink>
              </li>
            ))}
          </RuleIndexList>
        </RuleIndex>
        <RuleMarkdown markdown={copy.markdown} rankingTitle={copy.rankingTitle} />
      </RulebookGrid>
    </GuidePageShell>
  );
}

export function EnglishRulebook() {
  return <Rulebook language="en" />;
}
