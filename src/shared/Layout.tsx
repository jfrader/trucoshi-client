import {
  AppBar,
  Paper,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { themes } from "../theme";
import { Link } from "../components/Link";
import { TOOLBAR_LINKS } from "../links/links";
import { TrucoshiText } from "./TrucoshiText";
import useStateStorage from "../hooks/useStateStorage";
import { CardThemeToggle } from "../components/CardThemeToggle";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

const themeChoices = [themes.light, themes.dark];

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  return (
    <ThemeProvider theme={themeChoices[Number(Boolean(dark))]}>
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <Link to="/" lineHeight={4}>
            <Typography height="26px" variant="h6">
              <TrucoshiText height="26px" />
            </Typography>
          </Link>
          <Box flexGrow={1} />
          <Stack pt={1} direction="row" spacing={2} alignItems="center">
            <CardThemeToggle />
            {TOOLBAR_LINKS.map(({ to, Icon }) => {
              return (
                <Link key={to} to={to}>
                  <Icon fontSize="small" />
                </Link>
              );
            })}
            <Switch
              size="small"
              defaultChecked={Boolean(dark)}
              onChange={() =>
                setDark((current) => {
                  return current ? "" : "true";
                })
              }
            />
          </Stack>
        </Toolbar>
      </AppBar>
      <main style={{ position: "relative" }}>
        <Paper
          className="App"
          sx={(theme) => ({ borderRadius: 0, background: theme.palette.background.default })}
        >
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