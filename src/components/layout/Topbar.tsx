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
        <Stack direction="row" spacing={2} alignItems="center">
          <CardThemeToggle />
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
          {TOOLBAR_LINKS.map(({ to, Icon, title }) => {
            return (
              <Link title={title} key={to} to={to}>
                <Stack direction="row" alignItems="center">
                  <Icon fontSize="small" />
                </Stack>
              </Link>
            );
          })}
          {account ? (
            <Link to="/profile">
              <Stack direction="row" fontSize="small" gap={1} alignItems="center">
                <Person2 fontSize="small" />
                {account.name}
              </Stack>
            </Link>
          ) : (
            <Link title="Iniciar Sesion" to="/login">
              <Login fontSize="small" />
            </Link>
          )}
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
