import { useContext } from "react";
import { TrucoshiContext } from "../state/trucoshi/context";
import { ITrucoshiActions } from "../state/trucoshi/types";

export const useTrucoshiAction = (): ITrucoshiActions => {
  const context = useContext(TrucoshiContext);

  if (!context) {
    throw new Error("useTrucoshiAction must be used inside TrucoshiProvider");
  }

  return context.dispatch;
};
