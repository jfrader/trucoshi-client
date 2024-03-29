import {
  Backdrop as MuiBackdrop,
  BackdropProps,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { PropsWithChildren } from "react";

export const Backdrop = ({
  message,
  loading,
  children,
  ...props
}: PropsWithChildren<BackdropProps & { message?: string; loading?: boolean }>) => {
  return (
    <MuiBackdrop
      {...props}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: "text.primary",
        maxHeight: "100vh",
        backgroundColor: "rgb(0, 0, 0, 0.9)",
        overflow: 'hidden',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
      >
        {message ? <Typography variant="h4">{message}</Typography> : null}
        {loading ? (
          <Box mt={4}>
            <CircularProgress color="inherit" />
          </Box>
        ) : null}
        <Box>{children}</Box>
      </Box>
    </MuiBackdrop>
  );
};
