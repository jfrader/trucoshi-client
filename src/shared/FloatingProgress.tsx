import { CircularProgress, Stack } from "@mui/material";

export const FloatingProgress = () => {
  return (
    <Stack
      position="absolute"
      width="100vw"
      height="80vh"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress />
    </Stack>
  );
};
