import { Button, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Deck, Table } from "trucoshi/dist/lib";
import { GameCard } from "../card/GameCard";
import { IMatchDetails } from "trucoshi";
import { MatchHand } from "trucoshi/prisma/client";

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
          <GameCard key={card} card={card} />
        ))}
      </Stack>
      <Stack pt={2} gap={3}>
        <TextField
          name="secret"
          label="Secreto Server"
          InputProps={{ readOnly: true }}
          value={deck.random.secret}
          size="small"
        />

        <TextField
          name={`secret-${clientIdx + 1}`}
          label={`Secreto Dealer: Jugador ${clientIdx + 1}`}
          InputProps={{ readOnly: true }}
          value={deck.random.clients[clientIdx]}
          size="small"
        />
      </Stack>
    </Stack>
  );
};
