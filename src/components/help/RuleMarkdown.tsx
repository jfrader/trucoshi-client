import { Box, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { CardRanking } from "./CardRanking";

const CARD_RANKING_MARKER = "{{CARD_RANKING}}";

type RuleBlock =
  | { type: "heading"; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ranking" };

export type RuleHeading = {
  id: string;
  text: string;
};

export function ruleHeadingId(heading: string) {
  return heading
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseRuleMarkdown(markdown: string): RuleBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: RuleBlock[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex].trim();

    if (!line) {
      lineIndex += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push({ type: "heading", text, id: ruleHeadingId(text) });
      lineIndex += 1;
      continue;
    }

    if (line === CARD_RANKING_MARKER) {
      blocks.push({ type: "ranking" });
      lineIndex += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (lineIndex < lines.length && lines[lineIndex].trim().startsWith("- ")) {
        items.push(lines[lineIndex].trim().slice(2).trim());
        lineIndex += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines = [line];
    lineIndex += 1;
    while (lineIndex < lines.length) {
      const nextLine = lines[lineIndex].trim();
      if (
        !nextLine ||
        nextLine.startsWith("## ") ||
        nextLine.startsWith("- ") ||
        nextLine === CARD_RANKING_MARKER
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      lineIndex += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export function getRuleHeadings(markdown: string): RuleHeading[] {
  return parseRuleMarkdown(markdown).flatMap((block) =>
    block.type === "heading" ? [{ id: block.id, text: block.text }] : [],
  );
}

const MarkdownRoot = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  "& > :first-of-type": {
    marginTop: 0,
  },
}));

const RuleHeading = styled("h2")(({ theme }) => ({
  position: "relative",
  scrollMarginTop: "6rem",
  margin: theme.spacing(8, 0, 2),
  paddingTop: theme.spacing(2.5),
  color: theme.palette.text.primary,
  fontSize: "clamp(1.65rem, 3.2vw, 2.55rem)",
  fontWeight: 900,
  lineHeight: 1.06,
  letterSpacing: "-0.04em",
  textWrap: "balance",
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.14)}`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: -1,
    left: 0,
    width: "3.5rem",
    height: 2,
    backgroundColor: theme.palette.primary.main,
  },
}));

const RuleParagraph = styled(Typography)(({ theme }) => ({
  maxWidth: "68ch",
  marginBottom: theme.spacing(2.25),
  color: alpha(theme.palette.text.primary, 0.78),
  fontSize: "clamp(1rem, 1.35vw, 1.08rem)",
  lineHeight: 1.82,
}));

const RuleList = styled("ul")(({ theme }) => ({
  display: "grid",
  maxWidth: "67ch",
  margin: theme.spacing(1, 0, 3.5),
  padding: 0,
  listStyle: "none",
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.13)}`,
}));

const RuleListItem = styled("li")(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(1.6, 1, 1.6, 3.6),
  color: alpha(theme.palette.text.primary, 0.8),
  fontSize: "1rem",
  lineHeight: 1.65,
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.13)}`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: "1.35rem",
    left: theme.spacing(1),
    width: ".55rem",
    height: ".55rem",
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.13)}`,
  },
}));

const RankingStage = styled(Box)(({ theme }) => ({
  margin: theme.spacing(3, 0, 4),
  padding: theme.spacing(2.5),
  overflow: "hidden",
  borderRadius: "1.25rem",
  background: [
    `radial-gradient(circle at 16% 12%, ${alpha(theme.palette.common.white, 0.08)}, transparent 30%)`,
    `linear-gradient(150deg, ${alpha(theme.palette.success.dark, 0.62)}, ${alpha(theme.palette.background.paper, 0.97)})`,
  ].join(", "),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.13)}`,
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
  },
  "& .MuiButton-root": {
    transformOrigin: "center",
  },
}));

export function RuleMarkdown({
  markdown,
  rankingTitle,
}: {
  markdown: string;
  rankingTitle: string;
}) {
  const blocks = parseRuleMarkdown(markdown);

  return (
    <MarkdownRoot data-testid="rulebook-content">
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          return (
            <RuleHeading id={block.id} key={block.id}>
              {block.text}
            </RuleHeading>
          );
        }

        if (block.type === "list") {
          return (
            <RuleList key={`list-${blockIndex}`}>
              {block.items.map((item) => (
                <RuleListItem key={item}>{item}</RuleListItem>
              ))}
            </RuleList>
          );
        }

        if (block.type === "ranking") {
          return (
            <RankingStage key="card-ranking">
              <CardRanking compact title={rankingTitle} />
            </RankingStage>
          );
        }

        return <RuleParagraph key={`paragraph-${blockIndex}`}>{block.text}</RuleParagraph>;
      })}
    </MarkdownRoot>
  );
}
