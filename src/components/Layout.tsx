import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren, useState } from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../theme";
import { Link } from "./Link";
import { TrucoshiLogo } from "./TrucoshiLogo";
import { TOOLBAR_LINKS } from "../links/links";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { GameCard } from "./GameCard";
import { ICard } from "trucoshi";
import { Close } from "@mui/icons-material";
import { TrucoshiText } from "./TrucoshiText";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

const xx = "xx" as ICard;

export const Layout = ({ children }: PropsWithChildren<{}>) => {
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
    <ThemeProvider theme={theme}>
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
              disabled={!cardsReady}
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              {cardTheme ? (
                <GameCard as={Box} width="1.1em" card={xx} />
              ) : (
                <TrucoshiLogo style={{ paddingBottom: "0.5em" }} height="100%" />
              )}
            </Button>
            <Menu
              id="card-theme-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "card-theme-button",
              }}
            >
              <MenuItem sx={{ textAlign: "center" }} onClick={() => setCardTheme("gnu")}>
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
