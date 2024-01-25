import { Box, Stack, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { Outlet } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { FooterLink } from "../components/layout/FooterLink";
import { GENERAL_LINKS } from "../assets/links/links";

export const HeadlessMain = () => {
  const [{ version }] = useTrucoshi();

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
                <FooterLink key={to} Icon={Icon} to={to}>
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
