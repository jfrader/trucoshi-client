import { useContext, useEffect, useState } from "react";
import { TrucoshiContext } from "../context";
import { ITrucoshiActions, ITrucoshiState } from "../types";

export const useTrucoshi = (): [ITrucoshiState, ITrucoshiActions, boolean] => {
  const context = useContext(TrucoshiContext);

  const [hydrated, setHydrated] = useState(false);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(
    () =>
      setHydrated((current) => {
        if (context.state.cardTheme) {
          return context.state.cardsReady;
        }
        if (current) {
          return current;
        }
        return true;
      }),
    [context.state.cardTheme, context.state.cardsReady]
  );

  return [context.state, context.dispatch, hydrated];
};
