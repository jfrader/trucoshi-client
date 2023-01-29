import { useContext } from "react";
import { TrucoshiContext } from "../state/trucoshi/context";
import { ITrucoshiState } from "../state/trucoshi/types";

export const useTrucoshiState = (): ITrucoshiState => {
  const context = useContext(TrucoshiContext);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  return context.state;
};
