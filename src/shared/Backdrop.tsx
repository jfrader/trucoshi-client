import {
  Backdrop as MuiBackdrop,
  BackdropProps,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { PropsWithChildren } from "react";
import { TrucoshiText } from "./TrucoshiText";

export type TrucoshiBackdropProps<T extends Record<string, any> = Record<string, any>> =
  PropsWithChildren<
    BackdropProps & {
      message?: string;
      loading?: boolean;
      opacity?: number;
      hideLogo?: boolean;
      showChat?: boolean;
    } & T
  >;

export const Backdrop = ({
  message,
  loading,
  children,
  hideLogo,
  opacity = 0.9,
  showChat,
  ...props
}: TrucoshiBackdropProps) => {
  return (
    <MuiBackdrop
      {...props}
      sx={{
        zIndex: (theme) => (showChat ? theme.zIndex.appBar - 1 : theme.zIndex.drawer + 1),
        color: "text.primary",
        maxHeight: "100vh",
        backgroundColor: `rgb(0, 0, 0, ${opacity})`,
        overflow: "hidden",
        ...props.sx,
      }}
    >
      <Box
        gap={4}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
      >
        {hideLogo ? null : <TrucoshiText height="26px" />}
        {message ? <Typography variant="h4">{message}</Typography> : null}
        {loading ? (
          <Box mt={1}>
            <CircularProgress color="primary" />
          </Box>
        ) : null}
        <Box>{children}</Box>
      </Box>
    </MuiBackdrop>
  );
};
