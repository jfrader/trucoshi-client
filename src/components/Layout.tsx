import { createTheme, Paper, ThemeProvider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { Debug } from "./Debug";

const theme = createTheme({ palette: { mode: "dark" } });

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <Box py={2}>
            <Typography variant="h3">Trucoshi</Typography>
          </Box>
          <Paper elevation={4}>
            {children}
            <Outlet />
          </Paper>
        </header>
        <main>
          <Debug />
        </main>
      </div>
    </ThemeProvider>
  );
};
