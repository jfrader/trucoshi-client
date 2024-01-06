import {
  AppBar,
  CssBaseline,
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
import { Link } from "./Link";
import { TOOLBAR_LINKS } from "../assets/links/links";
import { TrucoshiText } from "./TrucoshiText";
import useStateStorage from "../hooks/useStateStorage";
import { CardThemeToggle } from "../components/CardThemeToggle";
import { CardBackdrop } from "./CardBackdrop";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { Login, Person2 } from "@mui/icons-material";

const LayoutContainer = styled(Box)(({ theme }) => [
  `
    *::-webkit-scrollbar {
      width: ${theme.spacing(1)};
    }
    *::-webkit-scrollbar-track {
      background: ${theme.palette.background.paper};
    }
    /* Handle */
    *::-webkit-scrollbar-thumb {
      background: ${theme.palette.text.disabled};
    }
    /* Handle on hover */
    *::-webkit-scrollbar-thumb:hover {
      background: ${theme.palette.text.secondary};
    }
  `,
  {
    [theme.breakpoints.up("md")]: {
      paddingTop: "52px",
    },
  },
]);

const themeChoices = [themes.light, themes.dark];

export const Layout = ({ children }: PropsWithChildren) => {
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [{ inspectedCard, cardsReady, account }, { inspectCard }] = useTrucoshi();
  return (
    <ThemeProvider theme={themeChoices[Number(Boolean(dark))]}>
      <CssBaseline />
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
            {TOOLBAR_LINKS.map(({ to, Icon, title }) => {
              return (
                <Link title={title} key={to} to={to}>
                  <Icon fontSize="small" />
                </Link>
              );
            })}

            {account ? (
              <Link to="/profile">
                <Person2 fontSize="small" />
              </Link>
            ) : (
              <Link title="Iniciar Sesion" to="/login">
                <Login fontSize="small" />
              </Link>
            )}

            <Switch
              size="small"
              title="Dark Theme"
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
      <CardBackdrop card={inspectedCard} cardsReady={cardsReady} inspectCard={inspectCard} />
    </ThemeProvider>
  );
};
