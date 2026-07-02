import { useSound } from "../../sound/hooks/useSound";

type TreasureSound = Pick<ReturnType<typeof useSound>, "queue">;

const silentSound: TreasureSound = {
  queue: () => undefined,
};

export const useTreasureSound = (): TreasureSound => {
  try {
    return useSound();
  } catch (error) {
    if (error instanceof Error && error.message === "useSound must be used inside SoundProvider") {
      return silentSound;
    }

    throw error;
  }
};
