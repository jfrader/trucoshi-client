import { Box, Stack, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { Outlet } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { TrucoshiText } from "../components/TrucoshiText";
import { Link } from "../components/Link";
import { FooterLink } from "../components/FooterLink";
import { GENERAL_LINKS } from "../links/links";

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
        <Stack
          flexGrow={1}
          alignItems="center"
          direction="column"
          justifyContent="end"
          spacing={1}
          pt={4}
        >
          {version ? (
            <Typography display="block" variant="caption">
              Version {version}
            </Typography>
          ) : null}
          <Stack alignContent="space-evenly" alignItems="center" direction="column" spacing={1}>
            {GENERAL_LINKS.map(({ label, to, Icon }) => {
              return (
                <FooterLink Icon={Icon} to={to}>
                  {label}
                </FooterLink>
              );
            })}
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
};
