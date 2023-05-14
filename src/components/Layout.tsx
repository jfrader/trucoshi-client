import {
  AppBar,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectProps,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../theme";
import { Link } from "./Link";
import { TrucoshiLogo } from "./TrucoshiLogo";
import { TOOLBAR_LINKS } from "../links/links";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { ICardTheme } from "../trucoshi/types";

const LayoutContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingTop: "52px",
  },
}));

const CardThemeSelect = Select<ICardTheme>;

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  const [{ cardTheme }, { setCardTheme }] = useTrucoshi();

  const onCardThemeChange: SelectProps<ICardTheme>["onChange"] = (e) => {
    setCardTheme(e.target.value as ICardTheme);
  };

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
          <Stack pt={1} direction="row" spacing={2} alignItems="center">
            <InputLabel id="select-card-theme-label">Cartas</InputLabel>
            <CardThemeSelect
              labelId="select-card-theme-label"
              id="selec-card-theme"
              value={cardTheme}
              label="Cartas"
              onChange={onCardThemeChange}
            >
              {/* <MenuItem value={'default'}>Twenty</MenuItem> */}
              <MenuItem value={"gnu"}>GNU</MenuItem>
              <MenuItem value={"classic"}>Classic</MenuItem>
              <MenuItem value={""}>Emojis</MenuItem>
            </CardThemeSelect>
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
