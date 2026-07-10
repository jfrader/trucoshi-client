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
    indexLabel: "Guía 04 / Reglas",
    eyebrow: "Del envido al vale cuatro",
    title: "Reglas del Truco, para tener a mano.",
    intro:
      "Una guía clara del Truco argentino que jugamos en Trucoshi: equipos, bazas, tantos, flor y cada canto de la mesa.",
    editorialTitle: "Primero entendé la mano. Después, hacete el distraído.",
    links: [
      { label: "Truco online", to: "/truco-online" },
      { label: "Ranking de cartas", to: "/ranking-cartas-truco" },
      { label: "Truco argentino", to: "/truco-argentino" },
    ] satisfies SeoPageLink[],
    sections: [
      {
        title: "Tres cartas, hasta tres bazas",
        body: "La mano se gana llevando dos bazas. Si hay pardas, importa quién es mano y cómo se resolvieron las otras vueltas.",
      },
      {
        title: "Cada quiero cambia el partido",
        body: "Envido, flor y truco son apuestas distintas. Podés aceptar, subir o rechazar; cada decisión modifica los puntos en juego.",
      },
    ],
    copy: undefined,
  },
  en: {
    cardRankingTitle: "Visual card ranking",
    markdown: englishRules,
    indexLabel: "Guide 04 / Rules",
    eyebrow: "From envido to vale cuatro",
    title: "Argentinian Truco rules, within reach.",
    intro:
      "A clear guide to the version of Argentinian Truco played on Trucoshi: teams, tricks, envido, flor and every raise at the table.",
    editorialTitle: "Understand the hand first. Bluff later.",
    links: [
      { label: "Play Truco online", to: "/truco-online" },
      { label: "Card ranking", to: "/ranking-cartas-truco" },
      { label: "Rules in Spanish", to: "/reglas-del-truco" },
    ] satisfies SeoPageLink[],
    sections: [
      {
        title: "Three cards, up to three tricks",
        body: "A hand is won by taking two tricks. When tricks are tied, the mano and the outcome of the other rounds decide the result.",
      },
      {
        title: "Every quiero changes the stakes",
        body: "Envido, flor and truco are separate bets. You can accept, raise or decline; every decision changes the points at stake.",
      },
    ],
    copy: {
      backLabel: "Back",
      primaryActionLabel: "Play now",
      heroVisualCaption: "2 · 4 · 6 players / web",
      navigationLabel: "Keep exploring",
      editorialEyebrow: "The table, explained",
      faqEyebrow: "Before the deal",
      faqHeading: "Quick questions.",
      finalEyebrow: "The table is ready",
      finalTitle: "Three cards. One decision. Play now.",
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
