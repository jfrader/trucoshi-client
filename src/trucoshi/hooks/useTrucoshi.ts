import { useContext, useEffect, useState } from "react";
import { TrucoshiContext } from "../state/context";
import { ITrucoshiActions, ITrucoshiState } from "../types";

export const useTrucoshi = (): [ITrucoshiState, ITrucoshiActions, boolean] => {
  const context = useContext(TrucoshiContext);

  const [hydrated, setHydrated] = useState(false);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    setHydrated(context.state.cardsReady);
  }, [context.state.cardsReady]);

  return [context.state, context.dispatch, hydrated];
};
