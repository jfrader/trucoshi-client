import { AppBar, Paper, ThemeProvider, Toolbar, Typography, styled } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../theme";
import { Debug } from "./Debug";
import { Link } from "./Link";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  const [{ id }] = useTrucoshi();
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed" sx={{ opacity: 0.4 }}>
        <Toolbar variant="dense">
          <Link to="/">
            <Typography variant="h6">Trucoshi</Typography>
          </Link>
          <Box flexGrow={1} />
          <Typography variant="subtitle1">{id}</Typography>
        </Toolbar>
      </AppBar>
      <div className="App">
        <Box className="App-header" display="flex"  alignItems="start">
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <LayoutContainer display="flex" justifyContent="center" alignItems="center" pt="50px">
              <Paper elevation={4}>
                <Box
                  minWidth="20vw"
                  minHeight="20vh"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {children}
                  <Outlet />
                </Box>
              </Paper>
            </LayoutContainer>
          </Box>
        </Box>
        <main>
          <Debug />
        </main>
      </div>
    </ThemeProvider>
  );
};
