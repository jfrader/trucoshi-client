import { useContext, useEffect, useState } from "react";
import { TrucoshiContext } from "../context";
import { ITrucoshiActions, ITrucoshiState } from "../types";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "trucoshi";

export const useTrucoshi = (): [
  ITrucoshiState,
  ITrucoshiActions,
  Socket<ServerToClientEvents, ClientToServerEvents>,
  boolean
] => {
  const context = useContext(TrucoshiContext);

  const [hydrated, setHydrated] = useState(false);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(
    () =>
      !context.state.cardTheme || context.state.cardsReady
        ? setHydrated(() => {
            if (context.state.isLoggingIn) {
              return false;
            }
            return true;
          })
        : undefined,
    [context.state.cardTheme, context.state.cardsReady, context.state.isLoggingIn]
  );

  return [context.state, context.dispatch, context.socket, hydrated];
};
