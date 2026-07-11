import oneBasto from "../assets/cards/default/1b.png";
import oneEspada from "../assets/cards/default/1e.png";
import threeBasto from "../assets/cards/default/3b.png";
import threeCopa from "../assets/cards/default/3c.png";
import sevenEspada from "../assets/cards/default/7e.png";
import sevenOro from "../assets/cards/default/7o.png";
import { CardRanking } from "../components/help/CardRanking";
import {
  SeoLandingPage,
  type SeoPageLink,
} from "../components/seo/SeoLandingPage";
import { TRUCO_ONLINE_FAQS } from "../content/seo/trucoOnline";

const sharedLinks: SeoPageLink[] = [
  { label: "Reglas", to: "/reglas-del-truco" },
  { label: "Ranking", to: "/ranking" },
  { label: "Truco argentino", to: "/truco-argentino" },
];

export function TrucoOnline() {
  return (
    <SeoLandingPage
      indexLabel="Truco online"
      eyebrow="Jugá desde el navegador"
      title="Jugá Truco online gratis."
      intro="Jugá Truco argentino desde el navegador. Entrá a una mesa o creá la tuya; si faltan jugadores, podés sumar bots."
      editorialTitle="Cómo jugar en Trucoshi"
      heroCards={[sevenOro, oneEspada, threeBasto]}
      links={sharedLinks}
      sections={[
        {
          title: "Elegí una mesa",
          body: "Entrá a una partida abierta, buscá partida en la cola o creá una mesa con tus propias opciones.",
        },
        {
          title: "Jugá con bots",
          body: "Podés sumar bots a la mesa para practicar o completar una partida.",
        },
        {
          title: "Jugá desde cualquier dispositivo",
          body: "Trucoshi funciona en el navegador, tanto en el celular como en la computadora.",
        },
      ]}
      faqs={TRUCO_ONLINE_FAQS}
    />
  );
}

export function TrucoArgentino() {
  return (
    <SeoLandingPage
      indexLabel="Truco argentino"
      eyebrow="Reglas del juego"
      title="Cómo se juega al Truco argentino"
      intro="El Truco argentino se juega con cartas españolas, bazas y apuestas como envido, truco, retruco, vale cuatro y flor."
      editorialTitle="Lo básico del Truco argentino"
      heroCards={[threeCopa, oneBasto, sevenEspada]}
      links={[
        { label: "Ver reglas", to: "/reglas-del-truco" },
        { label: "Truco online", to: "/truco-online" },
        { label: "Ranking de cartas", to: "/ranking-cartas-truco" },
      ]}
      sections={[
        {
          title: "Dos equipos, una mesa",
          body: "Se puede jugar de a 2, 4 o 6. Cada jugador recibe tres cartas y, en las partidas por equipos, juega con un compañero.",
        },
        {
          title: "Bazas y cantos",
          body: "La mano se gana al ganar dos bazas. El envido, el truco, el retruco y el vale cuatro definen los puntos en juego.",
        },
        {
          title: "Consultá las reglas",
          body: "Podés consultar las reglas y el ranking de cartas, o jugar con bots para practicar.",
        },
      ]}
    />
  );
}

export function RankingCartasTruco() {
  return (
    <SeoLandingPage
      indexLabel="Ranking de cartas"
      eyebrow="Orden de las cartas"
      title="Ranking de cartas del Truco"
      intro="El orden de fuerza de las cartas del Truco argentino, de mayor a menor."
      editorialTitle="Qué carta gana cada baza"
      heroCards={[oneBasto, oneEspada, sevenOro]}
      links={[
        { label: "Reglas completas", to: "/reglas-del-truco" },
        { label: "Truco argentino", to: "/truco-argentino" },
        { label: "Jugar online", to: "/truco-online" },
      ]}
      sections={[
        {
          title: "La carta más alta gana",
          body: "La carta con mayor valor en el ranking gana la baza. El orden no depende solo del número de la carta.",
        },
        {
          title: "Cuando la baza queda parda",
          body: "Si las cartas más altas empatan entre equipos contrarios, la baza queda parda. El resultado de las otras bazas y quién es mano definen la mano.",
        },
      ]}
    >
      <CardRanking compact title="Orden completo, de mayor a menor" />
    </SeoLandingPage>
  );
}
