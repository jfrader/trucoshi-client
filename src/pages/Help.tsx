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
      body: "Consultá las reglas, los cantos y el orden de las cartas.",
    },
    {
      title: "Practicá jugando",
      body: "Abrí el tutorial para practicar bazas, envido y truco.",
    },
    ...(ENABLE_BETS_AND_DEPOSITS
      ? [
          {
            title: "Entendé los pagos",
            body: "Conocé cómo usa Trucoshi Bitcoin y Lightning para los pagos.",
          },
        ]
      : []),
  ];

  return (
    <SeoLandingPage
      indexLabel="Ayuda"
      eyebrow="Reglas, cartas y soporte"
      title="Ayuda para jugar al Truco"
      intro={
        ENABLE_BETS_AND_DEPOSITS
          ? "Consultá las reglas, practicá una mano, revisá el ranking de cartas o conocé cómo usamos Bitcoin y Lightning."
          : "Consultá las reglas, practicá una mano y revisá el ranking de cartas."
      }
      editorialTitle="Elegí un tema"
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
          <HelpDirectoryTitle>Guías y herramientas</HelpDirectoryTitle>
          <HelpDirectoryLead>
            Reglas, tutorial y ranking de cartas.
          </HelpDirectoryLead>
        </HelpDirectoryHeader>

        <HelpTopicList>
          <HelpTopic open>
            <HelpTopicSummary>
              <HelpTopicKicker>Mesa y cartas</HelpTopicKicker>
              <HelpTopicTitle>Truco argentino</HelpTopicTitle>
              <HelpTopicDescription>
                Reglas en español e inglés, tutorial y ranking de cartas.
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
                  Información sobre los pagos con Bitcoin y Lightning.
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
