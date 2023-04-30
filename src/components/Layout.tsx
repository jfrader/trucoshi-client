import {
  AppBar,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../theme";
import { Link } from "./Link";
import { TrucoshiLogo } from "./TrucoshiLogo";
import { TOOLBAR_LINKS } from "../links/links";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <Link to="/" lineHeight={4}>
            <Typography height="26px" variant="h6">
              <TrucoshiLogo height="26px" />
            </Typography>
          </Link>
          <Box flexGrow={1} />
          <Stack pt={1} direction="row" spacing={2} alignItems="center">
            {TOOLBAR_LINKS.map(({ to, Icon }) => {
              return (
                <Link to={to}>
                  <Icon fontSize="small" />
                </Link>
              );
            })}
          </Stack>
        </Toolbar>
      </AppBar>
      <main style={{ position: "relative" }}>
        <Paper className="App" sx={{ borderRadius: 0 }}>
          <Box className="App-header" display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column" minWidth="100%" flexGrow={1}>
              <LayoutContainer
                display="flex"
                flexDirection="column"
                pt="50px"
                minWidth="100%"
                flexGrow={1}
              >
                <Box
                  minWidth="100%"
                  minHeight="20vh"
                  flexGrow={1}
                  display="flex"
                  flexDirection="column"
                >
                  {children}
                  <Outlet />
                </Box>
              </LayoutContainer>
            </Box>
          </Box>
        </Paper>
      </main>
    </ThemeProvider>
  );
};
