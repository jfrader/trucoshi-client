import { marked } from "marked";
import oneBasto from "../assets/cards/default/1b.png";
import oneEspada from "../assets/cards/default/1e.png";
import sevenEspada from "../assets/cards/default/7e.png";
import {
  SeoRulebookArticle,
  SeoRulebookMarkdown,
  SeoRulebookRanking,
} from "../components/seo/SeoLandingPage.styles";
import {
  SeoLandingPage,
  type SeoLandingPageCopy,
  type SeoPageLink,
} from "../components/seo/SeoLandingPage";
import spanishRules from "../content/rules/truco.es.md?raw";
import englishRules from "../content/rules/truco.en.md?raw";
import { CardRanking } from "../components/help/CardRanking";

const CARD_RANKING_MARKER = "{{CARD_RANKING}}";

const renderMarkdown = (markdown: string) => marked.parse(markdown, { async: false }) as string;

const rulebookByLanguage = {
  es: {
    cardRankingTitle: "Ranking visual de cartas",
    markdown: spanishRules,
    indexLabel: "Reglas del Truco",
    eyebrow: "Truco argentino",
    title: "Reglas del Truco argentino",
    intro:
      "Reglas para jugar al Truco argentino en Trucoshi: equipos, bazas, tantos, envido, flor y truco.",
    editorialTitle: "Reglas básicas",
    links: [
      { label: "Truco online", to: "/truco-online" },
      { label: "Ranking de cartas", to: "/ranking-cartas-truco" },
      { label: "Truco argentino", to: "/truco-argentino" },
    ] satisfies SeoPageLink[],
    sections: [
      {
        title: "Tres cartas, hasta tres bazas",
        body: "Una mano tiene hasta tres bazas. Gana el equipo que se lleva dos; si hay pardas, importa quién es mano y las otras bazas.",
      },
      {
        title: "Envido, flor y truco",
        body: "Son apuestas distintas. Podés aceptar, subir o rechazar; cada una cambia los puntos de la mano.",
      },
    ],
    copy: undefined,
  },
  en: {
    cardRankingTitle: "Visual card ranking",
    markdown: englishRules,
    indexLabel: "Truco rules",
    eyebrow: "Argentinian Truco",
    title: "Argentinian Truco rules",
    intro:
      "Rules for the version of Argentinian Truco played on Trucoshi: teams, tricks, scoring, envido, flor and truco.",
    editorialTitle: "Basic rules",
    links: [
      { label: "Play Truco online", to: "/truco-online" },
      { label: "Card ranking", to: "/ranking-cartas-truco" },
      { label: "Rules in Spanish", to: "/reglas-del-truco" },
    ] satisfies SeoPageLink[],
    sections: [
      {
        title: "Three cards, up to three tricks",
        body: "A hand has up to three tricks. The team that wins two takes the hand; tied tricks depend on mano and the other tricks.",
      },
      {
        title: "Envido, flor and truco",
        body: "They are separate bets. You can accept, raise or decline; each one changes the points for the hand.",
      },
    ],
    copy: {
      backLabel: "Back",
      primaryActionLabel: "Play now",
      heroVisualCaption: "2 · 4 · 6 players / web",
      navigationLabel: "More about Truco",
      editorialEyebrow: "How it works",
      faqEyebrow: "Frequently asked questions",
      faqHeading: "Frequently asked questions",
      finalEyebrow: "Ready to play?",
      finalTitle: "Join a table and play a match.",
      finalActionLabel: "Find a table",
    } satisfies SeoLandingPageCopy,
  },
} as const;

export type RulebookLanguage = keyof typeof rulebookByLanguage;

export function Rulebook({ language = "es" }: { language?: RulebookLanguage }) {
  const rulebook = rulebookByLanguage[language];
  const [beforeRanking, afterRanking] = rulebook.markdown.split(CARD_RANKING_MARKER);

  return (
    <SeoLandingPage
      indexLabel={rulebook.indexLabel}
      eyebrow={rulebook.eyebrow}
      title={rulebook.title}
      intro={rulebook.intro}
      editorialTitle={rulebook.editorialTitle}
      heroCards={[sevenEspada, oneEspada, oneBasto]}
      links={rulebook.links}
      sections={rulebook.sections}
      copy={rulebook.copy}
    >
      <SeoRulebookArticle>
        <SeoRulebookMarkdown
          data-testid="rulebook-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(beforeRanking) }}
        />
        <SeoRulebookRanking>
          <CardRanking compact title={rulebook.cardRankingTitle} />
        </SeoRulebookRanking>
        {afterRanking ? (
          <SeoRulebookMarkdown
            data-testid="rulebook-content-after-ranking"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(afterRanking) }}
          />
        ) : null}
      </SeoRulebookArticle>
    </SeoLandingPage>
  );
}
