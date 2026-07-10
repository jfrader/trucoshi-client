import oneBasto from "../assets/cards/default/1b.png";
import oneEspada from "../assets/cards/default/1e.png";
import threeBasto from "../assets/cards/default/3b.png";
import threeCopa from "../assets/cards/default/3c.png";
import sevenEspada from "../assets/cards/default/7e.png";
import sevenOro from "../assets/cards/default/7o.png";
import { CardRanking } from "../components/help/CardRanking";
import {
  SeoLandingPage,
  type SeoFaqItem,
  type SeoPageLink,
} from "../components/seo/SeoLandingPage";

const sharedLinks: SeoPageLink[] = [
  { label: "Reglas", to: "/reglas-del-truco" },
  { label: "Ranking", to: "/ranking" },
  { label: "Truco argentino", to: "/truco-argentino" },
];

const trucoOnlineFaqs: SeoFaqItem[] = [
  {
    question: "¿Se puede jugar gratis?",
    answer: "Sí. Podés entrar y jugar Truco online gratis, sin vueltas.",
  },
  {
    question: "¿Puedo jugar con bots?",
    answer: "Sí. Si falta gente, podés completar la partida con bots y jugar igual.",
  },
  {
    question: "¿Hace falta instalar algo?",
    answer: "No. Trucoshi corre en el navegador, desde el celu o la compu.",
  },
  {
    question: "¿Dónde veo las reglas?",
    answer:
      "Tenés las reglas del Truco argentino en la página de reglas, con envido y ranking de cartas.",
  },
];

export function TrucoOnline() {
  return (
    <SeoLandingPage
      indexLabel="Guía 01 / Truco online"
      eyebrow="Jugá desde el navegador"
      title="Truco online, sin esperar la sobremesa."
      intro="Entrá a Trucoshi, elegí una mesa y empezá. Partidas rápidas, bots cuando falta gente y nada que instalar."
      editorialTitle="De abrir la web a cantar Truco en minutos."
      heroCards={[sevenOro, oneEspada, threeBasto]}
      links={sharedLinks}
      sections={[
        {
          title: "Elegí cómo entrar",
          body: "Buscá una partida abierta, entrá a la cola o armá tu propia mesa. La experiencia está pensada para llegar al juego sin pasos de más.",
        },
        {
          title: "Practicá sin presión",
          body: "Si querés agarrarle la mano antes de jugar con gente, completá la mesa con bots y probá envido, truco, retruco y vale cuatro.",
        },
        {
          title: "Jugá donde estés",
          body: "Trucoshi funciona en el navegador del celular o la compu. Tus reglas, tu ranking y tus partidas quedan a un toque de distancia.",
        },
      ]}
      faqs={trucoOnlineFaqs}
    />
  );
}

export function TrucoArgentino() {
  return (
    <SeoLandingPage
      indexLabel="Guía 02 / Truco argentino"
      eyebrow="El juego de siempre"
      title="Truco argentino, de frente y sin vueltas."
      intro="Tres cartas, dos equipos y todo lo que pasa entre una mirada y un quiero. Trucoshi lleva la mesa argentina al navegador."
      editorialTitle="La picardía de la mesa, con reglas claras."
      heroCards={[threeCopa, oneBasto, sevenEspada]}
      links={[
        { label: "Ver reglas", to: "/reglas-del-truco" },
        { label: "Truco online", to: "/truco-online" },
        { label: "Ranking de cartas", to: "/ranking-cartas-truco" },
      ]}
      sections={[
        {
          title: "Dos equipos, una mesa",
          body: "Podés jugar de a 2, 4 o 6. Cada jugador recibe tres cartas españolas y comparte el objetivo con su compañero.",
        },
        {
          title: "Bazas y cantos",
          body: "La mano se define jugando cartas y midiendo cuándo subir la apuesta. El envido suma por tantos; truco, retruco y vale cuatro cambian el valor de la mano.",
        },
        {
          title: "Aprendé jugando",
          body: "Las reglas están siempre disponibles y los bots te dejan probar cantos sin esperar una mesa llena. La mejor forma de entender el Truco es repartir.",
        },
      ]}
    />
  );
}

export function RankingCartasTruco() {
  return (
    <SeoLandingPage
      indexLabel="Guía 03 / Ranking"
      eyebrow="Cada baza tiene un orden"
      title="Ranking de cartas: sabé qué manda."
      intro="El orden de fuerza del Truco argentino, de la espada más brava a las cartas que conviene guardar para engañar."
      editorialTitle="Leé la mesa antes de soltar una carta."
      heroCards={[oneBasto, oneEspada, sevenOro]}
      links={[
        { label: "Reglas completas", to: "/reglas-del-truco" },
        { label: "Truco argentino", to: "/truco-argentino" },
        { label: "Jugar online", to: "/truco-online" },
      ]}
      sections={[
        {
          title: "La más fuerte gana",
          body: "Cada carta tiene una jerarquía propia. La carta con mayor valor se lleva la baza, más allá del número que tenga impreso.",
        },
        {
          title: "Cuando la baza queda parda",
          body: "Si las cartas más altas empatan entre equipos contrarios, la baza queda parda. La mano y el resultado de las otras bazas deciden qué pasa después.",
        },
      ]}
    >
      <CardRanking compact title="Orden completo, de mayor a menor" />
    </SeoLandingPage>
  );
}
