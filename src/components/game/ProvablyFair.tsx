import { Alert, AlertTitle, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Deck, Table } from "trucoshi/dist/lib";
import { GameCard } from "../card/GameCard";
import { IMatchDetails } from "trucoshi";
import { MatchHand } from "trucoshi/prisma/client";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

type PlayerType = IMatchDetails["players"][0];

interface Props {
  players: PlayerType[];
  hands: MatchHand[];
}

const generateTable = ({ players }: { players: PlayerType[] }) => {
  return Table<PlayerType & { key: string }>(
    players.map((p) => ({
      ...p,
      key: p.idx ? p.idx.toString() : p.name,
    }))
  );
};

export const ProvablyFair = ({ players, hands }: Props) => {
  const [, { inspectCard }] = useTrucoshi();
  const [handIdx, setHand] = useState(1);
  const [clientIdx, setClient] = useState(0);
  const [deck, setDeck] = useState(() => Deck());

  useEffect(() => {
    const d = Deck();

    const hand = hands.find((h) => h.idx === handIdx);

    if (!hand) {
      return;
    }

    d.random.secret = hand.secret;
    d.random.clients = hand.clientSecrets;
    d.random.bitcoinHash = hand.bitcoinHash;
    d.random.bitcoinHeight = hand.bitcoinHeight;

    const table = generateTable({ players });

    for (let i = 1; i < handIdx; i++) {
      table.nextHand();
    }

    for (let i = 0; i < handIdx; i++) {
      d.random.next();
    }

    const c = table.getPlayerByPosition(0, true).idx || 0;
    d.shuffle(c);

    setClient(c);
    setDeck(d);
  }, [handIdx, hands, players]);

  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button disabled={handIdx === 1} onClick={() => setHand((c) => c - 1)}>
          Mano Anterior
        </Button>
        <Typography display="inline-block">{handIdx}</Typography>
        <Button
          disabled={!hands.find((h) => h.idx === handIdx + 1)}
          onClick={() => setHand((c) => c + 1)}
        >
          Mano Siguiente
        </Button>
      </Stack>
      <Stack pt={1} direction="row" flexWrap="wrap" justifyContent="center">
        {deck.cards.map((card) => (
          <GameCard onClick={() => inspectCard(card)} key={card} card={card} />
        ))}
      </Stack>
      <Stack pt={2} gap={3}>
        <TextField
          name="secret"
          color="info"
          label="Secreto Server"
          InputProps={{ readOnly: true }}
          value={deck.random.secret}
          focused
          size="small"
        />

        <TextField
          name={`secret-${clientIdx + 1}`}
          color="info"
          label={`Secreto Dealer: Jugador ${clientIdx + 1}`}
          InputProps={{ readOnly: true }}
          value={deck.random.clients[clientIdx]}
          focused
          size="small"
        />
        {deck.random.bitcoinHeight ? <Stack direction="row">
          <TextField
            name={`bitcoin-height`}
            color="info"
            label="Ultimo bloque de Bitcoin"
            InputProps={{ readOnly: true }}
            value={deck.random.bitcoinHeight}
            focused
            size="small"
          />
          <TextField
            fullWidth
            name={`bitcoin-hash`}
            color="info"
            label="Hash"
            InputProps={{ readOnly: true }}
            value={deck.random.bitcoinHash}
            focused
            size="small"
          />
        </Stack> : null}
        <Divider />
        <Alert sx={{ textAlign: "left" }} severity="info">
          <AlertTitle>Como funciona?</AlertTitle>
          <Typography variant="inherit" sx={{ pt: 1 }}>
            Cada partida el server genera:
            <ul>
              <li>Un secreto del server</li>
              <li>Un secreto para cada jugador</li>
            </ul>
            Cada mano el server usa:
            <ul>
              <li>El secreto del server</li>
              <li>El secreto del jugador mano</li>
              {deck.random.bitcoinHeight ? <li>El hash del ultimo bloque de Bitcoin</li> : null}
              <li>El numero de mano (1, 2, 3)</li>
            </ul>
            Como semilla y genera deterministicamente el reparto de cartas, que se hace como en la vida real:
            <ul>
              <li>Una carta para el primer jugador</li>
              <li>Una carta para el segundo jugador</li>
              <li>
                Y asi hasta repartir todas, de izquierda a derecha y de arriba hacia abajo en la
                grilla
              </li>
            </ul>
            <div>Al finalizar la partida, los secretos son revelados.</div>
          </Typography>
        </Alert>
      </Stack>
    </Stack>
  );
};
