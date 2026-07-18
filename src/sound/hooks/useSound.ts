import { useContext } from "react";
import { SoundContext } from "../sound.context";

export const useSound = () => {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used inside SoundProvider");
  }

  return context;
};
