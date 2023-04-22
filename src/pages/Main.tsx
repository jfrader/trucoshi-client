import { Box, Stack, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { Outlet } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { TrucoshiText } from "../components/TrucoshiText";
import { Favorite, GitHub } from "@mui/icons-material";
import { Link } from "../components/Link";

export const Main = () => {
  const [{ version }] = useTrucoshi();

  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
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
        <Box pt={4} pb={4} maxWidth="100%">
          <Link to="/">
            <TrucoshiText width="100%" style={{ objectFit: "contain" }} />
          </Link>
        </Box>
        <Outlet />
        {version ? (
          <Stack
            flexGrow={1}
            alignItems="center"
            direction="column"
            justifyContent="end"
            spacing={1}
            pt={4}
          >
            <Typography display="block" variant="caption">
              Version {version}
            </Typography>
            <Typography display="block" variant="caption">
              <Stack direction="row" justifyContent="center" spacing={2}>
                <Favorite fontSize="small" />
                <Link target="_blank" to="https://geyser.fund/project/trucoshi">
                  donate
                </Link>
              </Stack>
            </Typography>
            <Typography display="block" variant="caption">
              <Stack direction="row" justifyContent="center" spacing={2}>
                <GitHub fontSize="small" />
                <Link target="_blank" to="https://github.com/jfrader/trucoshi">
                  github
                </Link>
              </Stack>
            </Typography>
          </Stack>
        ) : null}
      </Box>
    </Container>
  );
};
