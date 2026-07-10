import { Box, Container } from "@mui/material";
import { Outlet } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { Footer } from "./Footer";

export const PageLayout = ({
  children,
  hideSocketBackdrop = false,
  fullBleed = false,
}: PropsWithChildren<{ hideSocketBackdrop?: boolean; fullBleed?: boolean }>) => {
  return (
    <Container
      disableGutters={fullBleed}
      maxWidth={fullBleed ? false : "lg"}
      sx={(theme) => ({
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        ...(fullBleed ? { backgroundColor: theme.trucoshiUi.seo.canvas } : null),
      })}
    >
      {hideSocketBackdrop ? null : <SocketBackdrop />}
      <Box
        pb={fullBleed ? 3 : 4}
        display="flex"
        flexDirection="column"
        flexGrow={1}
        justifyContent="start"
        alignItems="stretch"
        height="100%"
      >
        {children ?? <Outlet />}
        <Footer />
      </Box>
    </Container>
  );
};
