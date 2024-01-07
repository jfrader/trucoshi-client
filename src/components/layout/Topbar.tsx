import {
  AppBar,
  Box,
  ClickAwayListener,
  IconButton,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Link } from "../../shared/Link";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { CardThemeToggle } from "../card/CardThemeToggle";
import { TOOLBAR_LINKS } from "../../assets/links/links";
import { Close, Login, Menu, Person2 } from "@mui/icons-material";
import { Sidebar } from "./Sidebar";

export const Topbar = () => {
  const [{ isSidebarOpen, account, dark }, { setSidebarOpen, setDark }] = useTrucoshi();
  return (
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
          <ClickAwayListener onClickAway={() => setSidebarOpen(false)}>
            <Box>
              <IconButton
                title="Menu"
                size="small"
                onClick={() => setSidebarOpen((current) => !current)}
              >
                {isSidebarOpen ? <Close /> : <Menu />}
              </IconButton>
              <Sidebar />
            </Box>
          </ClickAwayListener>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
