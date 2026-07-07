import { MenuBookOutlined } from "@mui/icons-material";
import { Box, Card, CardContent, Stack } from "@mui/material";
import { marked } from "marked";
import { Navigate, useParams } from "react-router-dom";
import { PageContainer } from "../shared/PageContainer";
import spanishRules from "../content/rules/truco.es.md?raw";
import englishRules from "../content/rules/truco.en.md?raw";
import { CardRanking } from "../components/help/CardRanking";

const CARD_RANKING_MARKER = "{{CARD_RANKING}}";

const renderMarkdown = (markdown: string) => marked.parse(markdown, { async: false }) as string;

const markdownSx = {
  "& h1": { fontSize: "1.65rem", lineHeight: 1.2, marginTop: 0 },
  "& h2": { fontSize: "1.2rem", marginTop: 3 },
  "& p, & li": { color: "text.secondary", lineHeight: 1.65 },
  "& code": { bgcolor: "action.hover", borderRadius: 0.5, color: "text.primary", px: 0.5 },
  "& ol, & ul": { paddingLeft: 3 },
};

const rulebookByLanguage = {
  es: {
    title: "Reglas",
    markdown: spanishRules,
  },
  en: {
    title: "Rules",
    markdown: englishRules,
  },
} as const;

type RulebookLanguage = keyof typeof rulebookByLanguage;

const isRulebookLanguage = (lang?: string): lang is RulebookLanguage =>
  lang === "es" || lang === "en";

export const Rulebook = () => {
  const { lang } = useParams();

  if (!isRulebookLanguage(lang)) {
    return <Navigate to="/help/rules/es" replace />;
  }

  const rulebook = rulebookByLanguage[lang];
  const [beforeRanking, afterRanking] = rulebook.markdown.split(CARD_RANKING_MARKER);

  return (
    <PageContainer title={rulebook.title} icon={<MenuBookOutlined fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box
              data-testid="rulebook-content"
              sx={{
                ...markdownSx,
                "& > :last-child": { marginBottom: 0 },
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(beforeRanking) }}
            />
            <CardRanking compact  />
            {afterRanking ? (
              <Box
                data-testid="rulebook-content-after-ranking"
                sx={markdownSx}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(afterRanking) }}
              />
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
