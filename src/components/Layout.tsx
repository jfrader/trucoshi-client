import { Paper, ThemeProvider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../theme";
import { Debug } from "./Debug";
import { Link } from "./Link";

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <Box
            pb={10}
            height="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Box py={2}>
              <Link to="/">
                <Typography variant="h3">Trucoshi</Typography>
              </Link>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Paper elevation={4}>
                <Box minWidth="15em" minHeight="5em" display="flex">
                  {children}
                  <Outlet />
                </Box>
              </Paper>
            </Box>
          </Box>
        </header>
        <main>
          <Debug />
        </main>
      </div>
    </ThemeProvider>
  );
};
