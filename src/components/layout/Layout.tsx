import { Box, CssBaseline, Paper, ThemeProvider, styled, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { PropsWithChildren } from "react";
import { Outlet, useMatch as useRouteMatch } from "react-router-dom";
import { themes } from "../../theme";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { getInspectedCardKey } from "../../trucoshi/cards/cardInspection";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@mui/material";
import { RewardCodeHandler } from "../reward/RewardCodeHandler";
import { NoticeBannerSlot } from "../notice/NoticeBannerSlot";
import { useVersionReload } from "../../hooks/useVersionReload";

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

export const Layout = ({ children }: PropsWithChildren) => {
  const theme = useTheme();
  const matchRoute = useRouteMatch("/match/:sessionId");
  const lobbyRoute = useRouteMatch("/lobby/:sessionId");
  const isGameSurface = Boolean(matchRoute || lobbyRoute);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { modal } = useVersionReload({ currentVersion: import.meta.env.VITE_APP_VERSION });

  const [{ inspectedCard, cardDisplayMode, dark, isSidebarOpen }, { inspectCard }] = useTrucoshi();

  return (
    <ThemeProvider
      theme={dark === "true" ? themes.trucoshi : dark === "false" ? themes.light : themes.dark}
    >
      <CssBaseline />
      {!isGameSurface ? <Topbar /> : null}
      {isGameSurface && !isSidebarOpen ? (
        <Box
          sx={(theme) => ({
            position: "fixed",
            top: 0,
            right: 0,
            zIndex: theme.zIndex.drawer + 2,
          })}
        >
          <Topbar embedded compact={isMobile} />
        </Box>
      ) : null}
      <Sidebar topOffset={isGameSurface ? "0px" : "50px"} showEmbeddedTopbar={isGameSurface} />
      <RewardCodeHandler />
      <main style={{ position: "relative" }}>
        <Paper
          className="App"
          sx={(theme) => ({
            borderRadius: 0,
            background: theme.palette.background.default,
            ...(isGameSurface
              ? {
                  height: "100dvh",
                  maxHeight: "100dvh",
                  overflow: "hidden",
                }
              : null),
          })}
        >
          <Box
            className="App-header"
            display="flex"
            flexDirection="column"
            sx={
              isGameSurface
                ? {
                    height: "100dvh",
                    maxHeight: "100dvh",
                    minHeight: "100dvh",
                    overflow: "hidden",
                  }
                : undefined
            }
          >
            <Box display="flex" flexDirection="column" minWidth="100%" flexGrow={1}>
              <LayoutContainer
                className={isGameSurface ? "game-surface" : "app-surface"}
                display="flex"
                flexDirection="column"
                pt={isGameSurface ? 0 : "50px"}
                sx={
                  isGameSurface
                    ? (theme: Theme) => ({
                        height: "100dvh",
                        maxHeight: "100dvh",
                        overflow: "hidden",
                        [theme.breakpoints.up("md")]: {
                          paddingTop: 0,
                        },
                      })
                    : undefined
                }
                minWidth="100%"
                flexGrow={1}
              >
                {!isGameSurface ? <NoticeBannerSlot /> : null}
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

      <CardBackdrop
        key={getInspectedCardKey(inspectedCard)}
        card={inspectedCard}
        displayMode={cardDisplayMode}
        inspectCard={inspectCard}
      />

      <ConfirmationModal preventCloseOnBackdropClick {...modal} />
    </ThemeProvider>
  );
};
