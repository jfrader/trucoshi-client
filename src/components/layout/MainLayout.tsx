import { Box, Container, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { Link } from "../../shared/Link";
import { CardToggler } from "../card/CardToggler";
import { Footer } from "./Footer";

export const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <Container sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <SocketBackdrop />
      <Box
        p={{ xs: 2, sm: 4 }}
        display="flex"
        flexDirection="column"
        flexGrow={1}
        justifyContent="start"
        alignItems="stretch"
        height="100%"
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          pt={1}
          pb={4}
          alignItems="center"
          justifyContent="center"
          columnGap={{ md: 1 }}
        >
          <Link display={{ xs: "none", md: "block" }} to="/">
            <TrucoshiText width="100%" height="120px" style={{ objectFit: "contain" }} />
          </Link>
          <CardToggler width={{ xs: "100%", md: "33%" }} minWidth={{ md: "18.5rem" }} />
        </Stack>
        {children ?? <Outlet />}
        <Footer />
      </Box>
    </Container>
  );
};
