import {
  AppBar,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren, useState } from "react";
import { Outlet } from "react-router-dom";
import { themes } from "../theme";
import { Link } from "./Link";
import { TrucoshiLogo } from "./TrucoshiLogo";
import { TOOLBAR_LINKS } from "../links/links";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { GameCard } from "./GameCard";
import { ICard } from "trucoshi";
import { Close } from "@mui/icons-material";
import { TrucoshiText } from "./TrucoshiText";
import useStateStorage from "../hooks/useStateStorage";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

const xx = "xx" as ICard;

const themeChoices = [themes.light, themes.dark];

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [{ cardTheme, cardsReady }, { setCardTheme }] = useTrucoshi();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
            <Button
              sx={{
                minWidth: "3em",
                width: "3em",
                heigth: "3em",
                minHeight: "3em",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              size="small"
              color="success"
              id="card-theme-button"
              disabled={Boolean(cardTheme && !cardsReady)}
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              {cardTheme ? (
                !cardsReady ? (
                  <CircularProgress size="1.1em" />
                ) : (
                  <GameCard as={Box} width="1.1em" card={xx} />
                )
              ) : (
                <TrucoshiLogo style={{ marginBottom: "0.4em" }} />
              )}
            </Button>
            <Menu
              id="card-theme-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              keepMounted
              MenuListProps={{
                "aria-labelledby": "card-theme-button",
              }}
            >
              <MenuItem onClick={() => setCardTheme("gnu")}>
                <GameCard
                  request
                  as={Box}
                  sx={{ margin: "0 auto" }}
                  theme="gnu"
                  width="1.1em"
                  card={xx}
                />
              </MenuItem>
              <MenuItem onClick={() => setCardTheme("classic")}>
                <GameCard
                  request
                  as={Box}
                  sx={{ margin: "0 auto" }}
                  theme="classic"
                  width="1.1em"
                  card={xx}
                />
              </MenuItem>
              <MenuItem onClick={() => setCardTheme("")}>
                <Close />
              </MenuItem>
            </Menu>
            <Switch
              defaultChecked={Boolean(dark)}
              onChange={() =>
                setDark((current) => {
                  return current ? "" : "true";
                })
              }
            />
            {TOOLBAR_LINKS.map(({ to, Icon }) => {
              return (
                <Link key={to} to={to}>
                  <Icon fontSize="small" />
                </Link>
              );
            })}
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
