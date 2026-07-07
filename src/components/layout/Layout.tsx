import {
  Box,
  CssBaseline,
  Paper,
  Stack,
  ThemeProvider,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { PropsWithChildren } from "react";
import { Outlet, useMatch as useRouteMatch } from "react-router-dom";
import { themes } from "../../theme";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { getInspectedCardKey } from "../../trucoshi/cards/cardInspection";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { Sidebar } from "./Sidebar";
import { RewardCodeHandler } from "../reward/RewardCodeHandler";
import { NoticeBannerSlot, TreasureBannerSlot } from "../notice/NoticeBannerSlot";
import { useVersionReload } from "../../hooks/useVersionReload";
import { QueueMatchOverlay } from "./QueueMatchOverlay";

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

const EmbeddedTopbarFrame = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 2,
}));

const AppPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "gameSurface",
})<{ gameSurface: boolean }>(({ gameSurface, theme }) => ({
  borderRadius: 0,
  background: theme.palette.background.default,
  ...(gameSurface
    ? {
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
      }
    : null),
}));

const AppHeaderFrame = styled(Box, {
  shouldForwardProp: (prop) => prop !== "gameSurface",
})<{ gameSurface: boolean }>(({ gameSurface }) => ({
  display: "flex",
  flexDirection: "column",
  ...(gameSurface
    ? {
        height: "100dvh",
        maxHeight: "100dvh",
        minHeight: "100dvh",
        overflow: "hidden",
      }
    : null),
}));

const SurfaceContainer = styled(LayoutContainer, {
  shouldForwardProp: (prop) => prop !== "gameSurface",
})<{ gameSurface: boolean }>(({ gameSurface, theme }) => ({
  display: "flex",
  flexDirection: "column",
  minWidth: "100%",
  flexGrow: 1,
  paddingTop: gameSurface ? 0 : "50px",
  ...(gameSurface
    ? {
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
      }
    : null),
  [theme.breakpoints.up("md")]: {
    paddingTop: gameSurface ? 0 : "52px",
  },
}));

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
        <EmbeddedTopbarFrame>
          <Topbar embedded compact={isMobile} />
        </EmbeddedTopbarFrame>
      ) : null}
      <Sidebar topOffset={isGameSurface ? "0px" : "50px"} showEmbeddedTopbar={isGameSurface} />
      <RewardCodeHandler />
      <main style={{ position: "relative" }}>
        <AppPaper className="App" gameSurface={isGameSurface}>
          <AppHeaderFrame className="App-header" gameSurface={isGameSurface}>
            <Box display="flex" flexDirection="column" minWidth="100%" flexGrow={1}>
              <SurfaceContainer
                className={isGameSurface ? "game-surface" : "app-surface"}
                gameSurface={isGameSurface}
              >
                {!isGameSurface ? (
                  <Stack position="sticky" width="100vw" left={0}>
                    <NoticeBannerSlot />
                    <TreasureBannerSlot />
                  </Stack>
                ) : null}

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
              </SurfaceContainer>
            </Box>
          </AppHeaderFrame>
        </AppPaper>
      </main>

      <CardBackdrop
        key={getInspectedCardKey(inspectedCard)}
        card={inspectedCard}
        displayMode={cardDisplayMode}
        inspectCard={inspectCard}
      />

      <QueueMatchOverlay />

      <ConfirmationModal preventCloseOnBackdropClick {...modal} />
    </ThemeProvider>
  );
};
