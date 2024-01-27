import { Box } from "@mui/material";
import { Container } from "@mui/system";
import { Outlet } from "react-router-dom";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { Footer } from "./Footer";

export const PageLayout = () => {
  return (
    <Container sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <SocketBackdrop message="Conectando..." />
      <Box
        pb={4}
        display="flex"
        flexDirection="column"
        flexGrow={1}
        justifyContent="start"
        alignItems="stretch"
        height="100%"
      >
        <Outlet />
        <Footer />
      </Box>
    </Container>
  );
};
