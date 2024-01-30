import { List, ListItem, ListItemSecondaryAction, ListItemText, ListProps } from "@mui/material";
import { ReactNode } from "react";
import { ILobbyOptions } from "trucoshi";

export const LOBBY_OPTIONS_HUMAN_READABLE: Partial<Record<keyof ILobbyOptions, string>> = {
  maxPlayers: "Max. Jugadores",
  matchPoint: "Puntos por etapa",
  flor: "Flor",
  faltaEnvido: "Falta envido",
  satsPerPlayer: "Sats por jugador",
  turnTime: "Tiempo de turno",
  abandonTime: "Tiempo de abandono",
  handAckTime: "Tiempo entre manos",
};

const getSecondsFromMs = (value: number | boolean) => `${Math.round(Number(value) / 1000)}s`;

export const FILTERS: Partial<Record<keyof ILobbyOptions, (value: number | boolean) => ReactNode>> =
  {
    handAckTime: getSecondsFromMs,
    turnTime: getSecondsFromMs,
    abandonTime: getSecondsFromMs,
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
