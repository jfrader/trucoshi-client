import { createContext } from "react";
import { ISoundContext } from "../types";

export const SoundContext = createContext<ISoundContext | null>(null);
