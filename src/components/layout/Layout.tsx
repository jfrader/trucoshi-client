import {
  Box,
  CssBaseline,
  Paper,
  ThemeProvider,
  styled,
  useMediaQuery,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { PropsWithChildren, useEffect } from "react";
import { Outlet, useMatch as useRouteMatch } from "react-router-dom";
import { themes } from "../../theme";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { getInspectedCardKey } from "../../trucoshi/cards/cardInspection";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { useQuery } from "@tanstack/react-query";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@mui/material";
import { RewardCodeHandler } from "../reward/RewardCodeHandler";

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

const VERSION_CHECK_TIME = 1000 * 5 * 60;

export const Layout = ({ children }: PropsWithChildren) => {
  const modal = useConfirmationModal();
  const matchRoute = useRouteMatch("/match/:sessionId");
  const lobbyRoute = useRouteMatch("/lobby/:sessionId");
  const isGameSurface = Boolean(matchRoute || lobbyRoute);

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [{ inspectedCard, cardsReady, dark, isSidebarOpen }, { inspectCard }] = useTrucoshi();

  const versionCheck = useQuery({
    queryKey: ["app-version-check"],
    queryFn: async () => {
      const res = await fetch("/version.json");
      return res.json();
    },
    enabled: import.meta.env.MODE === "production",
    refetchInterval: VERSION_CHECK_TIME,
    gcTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (
      versionCheck.data &&
      versionCheck.data.version.trim() !== import.meta.env.VITE_APP_VERSION
    ) {
      modal.onOpen({
        onConfirm: () => {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        },
        acceptLabel: "Recargar",
        title: "Una nueva version esta disponible!",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionCheck.data, versionCheck.isFetching]);

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
        cardsReady={cardsReady}
        inspectCard={inspectCard}
      />

      <ConfirmationModal preventCloseOnBackdropClick {...modal} />
    </ThemeProvider>
  );
};
