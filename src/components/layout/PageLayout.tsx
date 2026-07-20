import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { Footer } from "./Footer";

export const PageLayout = ({
  children,
  hideSocketBackdrop = false,
  hideFooter = false,
  fullBleed = false,
}: PropsWithChildren<{
  hideSocketBackdrop?: boolean;
  hideFooter?: boolean;
  fullBleed?: boolean;
}>) => {
  return (
    <Container
      disableGutters={fullBleed}
      maxWidth={fullBleed ? false : "lg"}
      sx={(theme) => ({
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        ...(fullBleed ? { backgroundColor: theme.trucoshiUi.content.surface } : null),
      })}
    >
      {hideSocketBackdrop ? null : <SocketBackdrop />}
      <Box
        pb={hideFooter ? 0 : fullBleed ? 3 : 4}
        display="flex"
        flexDirection="column"
        flexGrow={1}
        justifyContent="start"
        alignItems="stretch"
        height="100%"
      >
        {children ?? <Outlet />}
        {hideFooter ? null : <Footer />}
      </Box>
    </Container>
  );
};
