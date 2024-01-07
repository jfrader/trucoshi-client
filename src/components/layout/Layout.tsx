import { CssBaseline, Paper, ThemeProvider, styled } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { themes } from "../../theme";
import useStateStorage from "../../hooks/useStateStorage";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";

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
  const [dark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [{ inspectedCard, cardsReady, cardTheme }, { inspectCard }] = useTrucoshi();
  return (
    <ThemeProvider theme={themeChoices[Number(Boolean(dark))]}>
      <CssBaseline />

      <Topbar />
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
      <CardBackdrop card={inspectedCard} cardsReady={cardsReady} inspectCard={inspectCard} cardTheme={cardTheme} />
    </ThemeProvider>
  );
};
