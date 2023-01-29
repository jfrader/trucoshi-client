import { createContext } from "react";
import { ITrucoshiContext } from "./types";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);
