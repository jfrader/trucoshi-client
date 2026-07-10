import oneEspada from "../assets/cards/default/1e.png";
import threeCopa from "../assets/cards/default/3c.png";
import sevenOro from "../assets/cards/default/7o.png";
import { BitcoinHelp } from "../components/help/BitcoinHelp";
import {
  HelpCredit,
  HelpCreditLink,
  HelpDirectory,
  HelpDirectoryHeader,
  HelpDirectoryLead,
  HelpDirectoryTitle,
  HelpTopic,
  HelpTopicContent,
  HelpTopicDescription,
  HelpTopicKicker,
  HelpTopicList,
  HelpTopicSummary,
  HelpTopicTitle,
} from "../components/help/HelpLandingContent.styles";
import { TrucoHelp } from "../components/help/TrucoHelp";
import { SeoLandingPage } from "../components/seo/SeoLandingPage";
import { GITHUB_LINK_FRAN } from "../assets/links/links";
import { ENABLE_BETS_AND_DEPOSITS } from "../config/features";

export function Help() {
  const sections = [
    {
      title: "Aprendé la mano",
      body: "Consultá las reglas completas, los cantos y el orden de las cartas sin salir del universo de Trucoshi.",
    },
    {
      title: "Practicá jugando",
      body: "Abrí el tutorial para probar bazas, envido y truco con una mesa preparada para aprender sin presión.",
    },
    ...(ENABLE_BETS_AND_DEPOSITS
      ? [
          {
            title: "Entendé los pagos",
            body: "Conocé por qué Trucoshi usa Bitcoin y Lightning para mover valor de forma rápida y con costos bajos.",
          },
        ]
      : []),
  ];

  return (
    <SeoLandingPage
      indexLabel="Centro / Ayuda"
      eyebrow="Reglas, cartas y soporte"
      title="Todo para sentarte a jugar."
      intro={
        ENABLE_BETS_AND_DEPOSITS
          ? "Aprendé el Truco argentino, practicá una mano, revisá el ranking de cartas o entendé cómo usamos Bitcoin y Lightning."
          : "Aprendé el Truco argentino, practicá una mano y revisá el ranking de cartas."
      }
      editorialTitle="Elegí qué querés resolver y seguí desde ahí."
      heroCards={[threeCopa, oneEspada, sevenOro]}
      links={[
        { label: "Reglas del Truco", to: "/reglas-del-truco" },
        { label: "Ranking de cartas", to: "/ranking-cartas-truco" },
        { label: "Truco online", to: "/truco-online" },
      ]}
      sections={sections}
    >
      <HelpDirectory>
        <HelpDirectoryHeader>
          <HelpDirectoryTitle>Guías y herramientas.</HelpDirectoryTitle>
          <HelpDirectoryLead>
            Todo el contenido sigue disponible; ahora está ordenado como una guía y no como una
            pantalla separada de la experiencia.
          </HelpDirectoryLead>
        </HelpDirectoryHeader>

        <HelpTopicList>
          <HelpTopic open>
            <HelpTopicSummary>
              <HelpTopicKicker>Mesa y cartas</HelpTopicKicker>
              <HelpTopicTitle>Truco argentino</HelpTopicTitle>
              <HelpTopicDescription>
                Reglas en español e inglés, tutorial práctico, comunidad y ranking visual.
              </HelpTopicDescription>
            </HelpTopicSummary>
            <HelpTopicContent>
              <TrucoHelp />
            </HelpTopicContent>
          </HelpTopic>

          {ENABLE_BETS_AND_DEPOSITS ? (
            <HelpTopic>
              <HelpTopicSummary>
                <HelpTopicKicker>Pagos instantáneos</HelpTopicKicker>
                <HelpTopicTitle>Bitcoin y Lightning Network</HelpTopicTitle>
                <HelpTopicDescription>
                  Una explicación directa de las tecnologías que usa Trucoshi para mover valor.
                </HelpTopicDescription>
              </HelpTopicSummary>
              <HelpTopicContent>
                <BitcoinHelp />
              </HelpTopicContent>
            </HelpTopic>
          ) : null}
        </HelpTopicList>

        <HelpCredit>
          Made with ❤️ by{" "}
          <HelpCreditLink target="_blank" to={GITHUB_LINK_FRAN.to}>
            Fran
          </HelpCreditLink>
        </HelpCredit>
      </HelpDirectory>
    </SeoLandingPage>
  );
}
