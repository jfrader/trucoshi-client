import { List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { ENABLE_BETS_AND_DEPOSITS } from "../../config/features";

export const BitcoinHelp = () => {
  if (!ENABLE_BETS_AND_DEPOSITS) {
    return null;
  }

  return (
    <Stack pt={2} direction="column" gap={2}>
      <Typography variant="h6">Bitcoin y Lightning Network</Typography>
      <Typography variant="body1">
        Información básica sobre Bitcoin y Lightning Network.
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold">
        ¿Qué es Bitcoin?
      </Typography>
      <Typography variant="body2">
        Bitcoin es una moneda digital que funciona en una red distribuida. Sus transacciones se
        registran en una blockchain, un registro público compartido por la red.
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="Descentralizado"
            secondary="No lo opera un banco ni una empresa central."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Registro público"
            secondary="Las transacciones se pueden verificar en la blockchain."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Billeteras"
            secondary="Para enviar o recibir Bitcoin necesitás una billetera compatible."
          />
        </ListItem>
      </List>

      <Typography variant="subtitle1" fontWeight="bold">
        ¿Qué es la Lightning Network?
      </Typography>
      <Typography variant="body2">
        Lightning Network es una red de pagos construida sobre Bitcoin. Permite enviar y recibir
        pagos fuera de la blockchain principal, lo que suele hacerlos más rápidos y baratos.
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="Transacciones instantáneas"
            secondary="Los pagos suelen confirmarse en segundos."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Bajas comisiones"
            secondary="Las comisiones suelen ser menores que en la blockchain principal."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Pagos pequeños"
            secondary="También se puede usar para enviar importes bajos."
          />
        </ListItem>
      </List>

      <Typography variant="subtitle1" fontWeight="bold">Uso en Trucoshi</Typography>
      <Typography variant="body2">
        Cuando los pagos están habilitados, Trucoshi usa Bitcoin y Lightning Network para procesar
        movimientos dentro de la plataforma.
      </Typography>

      {/* <Typography variant="subtitle1" fontWeight="bold">
        Más información
      </Typography>
      <Typography variant="body2">
        Si querés aprender más sobre Bitcoin y la Lightning Network, estos recursos son un buen
        punto de partida:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary={
              <Link target="_blank" to="https://bitcoin.org/es_AR/bitcoin-para-individuos">
                Bitcoin para principiantes
              </Link>
            }
            secondary="Aprendé los conceptos básicos de Bitcoin y cómo funciona."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <Link target="_blank" to="https://lightning.network">
                La Lightning Network
              </Link>
            }
            secondary="Entendé cómo esta tecnología hace que Bitcoin sea más rápido y económico."
          />
        </ListItem>
      </List> */}
    </Stack>
  );
};
