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
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "text.primary" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        height="4em"
      >
        {message ? <Typography variant="h4">{message}</Typography> : null}
        {loading ? (
          <Box mt={8}>
            <CircularProgress color="inherit" />
          </Box>
        ) : null}
        <Box mt={8}>{children}</Box>
      </Box>
    </MuiBackdrop>
  );
};
