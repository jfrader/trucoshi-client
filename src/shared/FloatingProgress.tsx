import { Stack } from "@mui/material";
import { TrucoshiProgress } from "./TrucoshiProgress";

export const FloatingProgress = () => {
  return (
    <Stack
      position="absolute"
      width="100vw"
      height="calc(var(--trucoshi-viewport-height, 100dvh) * 0.8)"
      justifyContent="center"
      alignItems="center"
    >
      <TrucoshiProgress />
    </Stack>
  );
};
