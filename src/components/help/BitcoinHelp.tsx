import { List, ListItem, ListItemText, Stack, Typography } from "@mui/material";

export const BitcoinHelp = () => {
  return (
    <Stack pt={2} direction="column" gap={2}>
      <Typography variant="h6">Bitcoin y Lightning Network</Typography>
      <Typography variant="body1">
        En esta sección te explicamos qué es Bitcoin y qué es la Lightning Network, dos tecnologías
        que están cambiando la forma en que usamos el dinero. Todo está explicado de manera clara y
        simple para que cualquiera pueda entenderlo.
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold">
        ¿Qué es Bitcoin?
      </Typography>
      <Typography variant="body2">
        Bitcoin es una moneda digital creada en 2009 por una persona o grupo anónimo conocido como
        Satoshi Nakamoto. A diferencia de monedas tradicionales como el peso o el dólar, Bitcoin no
        depende de bancos ni gobiernos. Funciona en una red descentralizada llamada blockchain, un
        registro público donde se anotan todas las transacciones. Esto hace que Bitcoin sea seguro,
        transparente y no pueda ser controlado por una sola entidad.
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="Descentralizado"
            secondary="No lo controla nadie en particular: lo mantienen miles de computadoras en todo el mundo."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Seguro"
            secondary="Las transacciones están protegidas por criptografía, lo que las hace muy difíciles de falsificar."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Global"
            secondary="Podés enviar Bitcoin a cualquier parte del mundo en minutos, sin intermediarios."
          />
        </ListItem>
      </List>

      <Typography variant="subtitle1" fontWeight="bold">
        ¿Qué es la Lightning Network?
      </Typography>
      <Typography variant="body2">
        La Lightning Network es una tecnología que se construyó sobre Bitcoin para hacerlo más
        rápido y económico. A veces, la blockchain de Bitcoin puede ser lenta o las comisiones
        pueden aumentar si hay muchas transacciones. La Lightning Network permite hacer pagos
        instantáneos con costos muy bajos, procesándolos fuera de la blockchain principal pero
        manteniendo la seguridad de Bitcoin. Es como un sistema de canales rápidos para mover dinero
        sin demoras.
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="Transacciones instantáneas"
            secondary="Los pagos se confirman en segundos, perfectos para operaciones rápidas."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Bajas comisiones"
            secondary="Podés enviar pequeñas cantidades sin pagar costos altos."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Escalabilidad"
            secondary="Permite millones de transacciones sin saturar la red de Bitcoin."
          />
        </ListItem>
      </List>

      <Typography variant="subtitle1" fontWeight="bold">
        ¿Por qué son importantes?
      </Typography>
      <Typography variant="body2">
        Bitcoin te da control sobre tu dinero sin depender de bancos o gobiernos, algo especialmente
        útil en Argentina, donde la inflación y las restricciones cambiarias son un desafío. La
        Lightning Network hace que Bitcoin sea práctico para pagos cotidianos, con transacciones
        rápidas y baratas. Juntas, estas tecnologías ofrecen una forma moderna de manejar dinero con
        más libertad.
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
