import {
  Box,
  CssBaseline,
  Paper,
  ThemeProvider,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, type PropsWithChildren } from "react";
import { Outlet, useMatch as useRouteMatch } from "react-router-dom";
import { themes } from "../../theme";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { useQuery } from "@tanstack/react-query";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
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
      paddingTop: theme.trucoshiUi.navigation.appBarHeightDesktop,
    },
  },
]);

const APP_VIEWPORT_HEIGHT = "var(--trucoshi-viewport-height, 100dvh)";

const EmbeddedTopbarFrame = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 3,
}));

const AppPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "gameSurface",
})<{ gameSurface: boolean }>(({ gameSurface, theme }) => ({
  borderRadius: 0,
  background: gameSurface ? theme.palette.background.default : theme.trucoshiUi.shell.background,
  ...(gameSurface
    ? {
        height: APP_VIEWPORT_HEIGHT,
        maxHeight: APP_VIEWPORT_HEIGHT,
        overflow: "hidden",
      }
    : { minHeight: APP_VIEWPORT_HEIGHT }),
}));

const AppHeaderFrame = styled(Box, {
  shouldForwardProp: (prop) => prop !== "gameSurface",
})<{ gameSurface: boolean }>(({ gameSurface }) => ({
  display: "flex",
  flexDirection: "column",
  ...(gameSurface
    ? {
        height: APP_VIEWPORT_HEIGHT,
        maxHeight: APP_VIEWPORT_HEIGHT,
        minHeight: APP_VIEWPORT_HEIGHT,
        overflow: "hidden",
      }
    : { minHeight: APP_VIEWPORT_HEIGHT }),
}));

const SurfaceContainer = styled(LayoutContainer, {
  shouldForwardProp: (prop) => prop !== "gameSurface",
})<{ gameSurface: boolean }>(({ gameSurface, theme }) => ({
  display: "flex",
  flexDirection: "column",
  minWidth: "100%",
  flexGrow: 1,
  paddingTop: gameSurface ? 0 : theme.trucoshiUi.navigation.appBarHeightMobile,
  ...(gameSurface
    ? {
        height: APP_VIEWPORT_HEIGHT,
        maxHeight: APP_VIEWPORT_HEIGHT,
        overflow: "hidden",
      }
    : null),
  [theme.breakpoints.up("md")]: {
    paddingTop: gameSurface ? 0 : theme.trucoshiUi.navigation.appBarHeightDesktop,
  },
}));

const VERSION_CHECK_TIME = 1000 * 5 * 60;

export const Layout = ({ children }: PropsWithChildren) => {
  const modal = useConfirmationModal();
  const matchRoute = useRouteMatch("/match/:sessionId");
  const lobbyRoute = useRouteMatch("/lobby/:sessionId");
  const isGameSurface = Boolean(matchRoute || lobbyRoute);

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [{ inspectedCard, dark }, { inspectCard }] = useTrucoshi();

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
      {!isGameSurface ? <Topbar compact={isMobile} /> : null}
      {isGameSurface ? (
        <EmbeddedTopbarFrame>
          <Topbar embedded compact={isMobile} />
        </EmbeddedTopbarFrame>
      ) : null}
      <Sidebar gameSurface={isGameSurface} />
      <main style={{ position: "relative" }}>
        <AppPaper className="App" gameSurface={isGameSurface}>
          <AppHeaderFrame className="App-header" gameSurface={isGameSurface}>
            <Box display="flex" flexDirection="column" minWidth="100%" flexGrow={1}>
              <SurfaceContainer
                className={isGameSurface ? "game-surface" : "app-surface"}
                gameSurface={isGameSurface}
              >
                <Box
                  minWidth="100%"
                  minHeight="20vh"
                  flexGrow={1}
                  display="flex"
                  flexDirection="column"
                >
                  {children ?? <Outlet />}
                </Box>
              </SurfaceContainer>
            </Box>
          </AppHeaderFrame>
        </AppPaper>
      </main>

      <CardBackdrop
        key={inspectedCard}
        card={inspectedCard}
        inspectCard={inspectCard}
      />

      <ConfirmationModal preventCloseOnBackdropClick {...modal} />
    </ThemeProvider>
  );
};
