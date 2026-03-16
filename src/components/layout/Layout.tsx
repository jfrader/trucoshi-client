import { ClickAwayListener, CssBaseline, IconButton, Paper, ThemeProvider, styled } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren, useEffect } from "react";
import { Outlet, useMatch as useRouteMatch } from "react-router-dom";
import { themes } from "../../theme";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { useQuery } from "@tanstack/react-query";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import { Menu, Close } from "@mui/icons-material";
import { Sidebar } from "./Sidebar";

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

  const [{ inspectedCard, cardsReady, cardTheme, dark, isSidebarOpen }, { inspectCard, setSidebarOpen }] = useTrucoshi();

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
      {isGameSurface ? (
        <ClickAwayListener onClickAway={() => setSidebarOpen(false)}>
          <Box sx={{ position: "fixed", top: "calc(env(safe-area-inset-top) + 0.35rem)", right: 6, zIndex: 1400 }}>
            <IconButton
              title="Menu"
              size="small"
              onClick={() => setSidebarOpen((current) => !current)}
              sx={{
                bgcolor: "rgba(16, 27, 22, 0.9)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              {isSidebarOpen ? <Close /> : <Menu />}
            </IconButton>
            <Sidebar topOffset="0px" showEmbeddedTopbar />
          </Box>
        </ClickAwayListener>
      ) : null}
      {!isGameSurface ? <Sidebar /> : null}
      <main style={{ position: "relative" }}>
        <Paper
          className="App"
          sx={(theme) => ({ borderRadius: 0, background: theme.palette.background.default })}
        >
          <Box className="App-header" display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column" minWidth="100%" flexGrow={1}>
              <LayoutContainer
                className={isGameSurface ? "game-surface" : "app-surface"}
                display="flex"
                flexDirection="column"
                pt={isGameSurface ? 0 : "50px"}
                sx={isGameSurface ? { "@media (min-width:900px)": { paddingTop: 0 } } : undefined}
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
        key={inspectedCard}
        card={inspectedCard}
        cardsReady={cardsReady}
        inspectCard={inspectCard}
        cardTheme={cardTheme}
      />

      <ConfirmationModal preventCloseOnBackdropClick {...modal} />
    </ThemeProvider>
  );
};
