import { Box, Stack } from "@mui/material";
import { Container } from "@mui/system";
import { Outlet } from "react-router-dom";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { Link } from "../../shared/Link";
import { CardToggler } from "../card/CardToggler";
import { Footer } from "./Footer";

export const MainLayout = () => {
  return (
    <Container sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <SocketBackdrop message="Conectando..." />
      <Box
        p={4}
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
        >
          <Link display={{ xs: "none", md: "block" }} to="/">
            <TrucoshiText width="100%" height="120em" style={{ objectFit: "contain" }} />
          </Link>
          <CardToggler width={{ xs: "80%", md: "33%" }} />
        </Stack>
        <Outlet />
        <Footer />
      </Box>
    </Container>
  );
};
