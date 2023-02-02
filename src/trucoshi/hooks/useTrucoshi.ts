import { useContext } from "react";
import { TrucoshiContext } from "../state/context";
import { ITrucoshiActions, ITrucoshiState } from "../types";

export const useTrucoshi = (): [ITrucoshiState, ITrucoshiActions] => {
  const context = useContext(TrucoshiContext);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  return [context.state, context.dispatch];
};
