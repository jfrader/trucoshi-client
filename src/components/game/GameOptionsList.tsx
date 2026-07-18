import { List, ListItem, ListItemSecondaryAction, ListItemText, ListProps } from "@mui/material";
import { ReactNode } from "react";
import { ILobbyOptions } from "trucoshi";
import { Sats } from "../../shared/Sats";

export const LOBBY_OPTIONS_HUMAN_READABLE: Partial<Record<keyof ILobbyOptions, string>> = {
  satsPerPlayer: "Sats por jugador",
  maxPlayers: "Max. Jugadores",
  matchPoint: "Puntos por etapa",
  faltaEnvido: "Falta envido",
  flor: "Flor",
  turnTime: "Tiempo de turno",
  abandonTime: "Tiempo de abandono",
};

const getSecondsFromMs = (value: number | boolean) => `${Math.round(Number(value) / 1000)}s`;

export const FILTERS: Partial<Record<keyof ILobbyOptions, (value: number | boolean) => ReactNode>> =
  {
    handAckTime: getSecondsFromMs,
    turnTime: getSecondsFromMs,
    abandonTime: getSecondsFromMs,
    satsPerPlayer: (sats) => {
      const props = sats ? { fontSize: "medium", color: "success.light", fontWeight: "bold" } : {};
      return <Sats {...props}>{Number(sats)}</Sats>;
    },
  };

export const GameOptionsList = ({
  options,
  keys,
  divider,
  ...props
}: {
  divider?: boolean;
  options: ILobbyOptions;
  keys?: (keyof ILobbyOptions)[];
} & ListProps) => {
  return (
    <List {...props}>
      {Object.entries(LOBBY_OPTIONS_HUMAN_READABLE)
        .filter(([key]) => (keys ? keys.includes(key as keyof ILobbyOptions) : true))
        .filter(
          ([key]) =>
            key !== "satsPerPlayer" || import.meta.env.VITE_ENABLE_BETS_AND_DEPOSITS === "1"
        )
        .map(([key, label]) => {
          const value = options[key as keyof ILobbyOptions];
          if (value === undefined) {
            return null;
          }
          const filter = FILTERS[key as keyof ILobbyOptions];
          const filtered = filter ? filter(value) : value;
          return (
            <ListItem divider={divider} disablePadding={props.dense} key={key}>
              <ListItemText disableTypography={props.dense} primary={label} />
              <ListItemSecondaryAction>
                {typeof filtered === "boolean" ? (filtered ? "Si" : "No") : filtered}
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
    </List>
  );
};
