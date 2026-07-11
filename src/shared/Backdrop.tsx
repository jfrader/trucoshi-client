import {
  Backdrop as MuiBackdrop,
  BackdropProps,
  Box,
  Portal,
  Stack,
  Typography,
} from "@mui/material";
import { PropsWithChildren } from "react";
import { TrucoshiText } from "./TrucoshiText";
import { TrucoshiProgress } from "./TrucoshiProgress";

const APP_VIEWPORT_HEIGHT = "var(--trucoshi-viewport-height, 100dvh)";

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
  open,
  sx,
  ...backdropProps
}: TrucoshiBackdropProps) => {
  return (
    <Portal>
      <MuiBackdrop
        {...backdropProps}
        data-trucoshi-overlay={open ? "open" : undefined}
        open={open}
        sx={[
          {
            position: "fixed",
            inset: "0 auto auto 0",
            zIndex: (theme) => (showChat ? theme.zIndex.appBar - 1 : theme.zIndex.drawer + 1),
            width: "100%",
            height: APP_VIEWPORT_HEIGHT,
            maxHeight: APP_VIEWPORT_HEIGHT,
            color: "text.primary",
            backgroundColor: `rgb(0, 0, 0, ${opacity})`,
            overflow: "hidden",
            overscrollBehavior: "contain",
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box
          boxSizing="border-box"
          data-testid="backdrop-viewport"
          display="flex"
          height="100%"
          maxHeight="100%"
          overflow="auto"
          px={2}
          pt="max(1rem, env(safe-area-inset-top))"
          pb="max(1rem, env(safe-area-inset-bottom))"
          sx={{ overscrollBehavior: "contain" }}
          width="100%"
        >
          <Stack
            alignItems="center"
            flexShrink={0}
            gap={4}
            justifyContent="space-between"
            margin="auto"
            maxWidth="100%"
            textAlign="center"
          >
            {hideLogo ? null : <TrucoshiText height="26px" />}
            {message ? <Typography variant="h4">{message}</Typography> : null}
            {loading ? (
              <Box mt={1}>
                <TrucoshiProgress />
              </Box>
            ) : null}
            <Box maxWidth="100%">{children}</Box>
          </Stack>
        </Box>
      </MuiBackdrop>
    </Portal>
  );
};
