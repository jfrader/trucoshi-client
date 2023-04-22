import { AppBar, Paper, ThemeProvider, Toolbar, Typography, styled } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../theme";
import { Link } from "./Link";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { TrucoshiLogo } from "./TrucoshiLogo";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  const [{ id }] = useTrucoshi();
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
          <Typography variant="subtitle1">{id}</Typography>
        </Toolbar>
      </AppBar>
      <main style={{ position: "relative" }}>
        <Paper className="App" sx={{ borderRadius: 0 }}>
          <Box className="App-header" display="flex" flexDirection="column">
            <Box
              display="flex"
              flexDirection="column"
              minWidth="100%"
              flexGrow={1}
            >
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
