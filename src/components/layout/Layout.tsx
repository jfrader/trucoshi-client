import { Box, Paper, Stack, styled, useMediaQuery, useTheme } from "@mui/material";
import { Outlet, useMatchRoute } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { getInspectedCardKey } from "../../trucoshi/cards/cardInspection";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { RewardCodeHandler } from "../reward/RewardCodeHandler";
import { NoticeBannerSlot, TreasureBannerSlot } from "../notice/NoticeBannerSlot";
import { QueueMatchOverlay } from "./QueueMatchOverlay";
import { MatchEntryOverlay } from "./MatchEntryOverlay";

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
  background: gameSurface
    ? theme.palette.background.default
    : theme.palette.mode === "light"
      ? theme.trucoshiUi.shell.lightBackground
      : theme.trucoshiUi.shell.darkBackground,
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
  const matchRoute = useMatchRoute();
  const matchParams = matchRoute({ to: "/match/$sessionId" });
  const lobbyParams = matchRoute({ to: "/lobby/$sessionId" });
  const isGameSurface = Boolean(matchParams || lobbyParams);
  const matchSessionId = matchParams ? matchParams.sessionId : undefined;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [{ inspectedCard, cardDisplayMode, isSidebarOpen }, { inspectCard }] = useTrucoshi();

  return (
    <>
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
                  {children ?? <Outlet />}
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
      {matchSessionId ? <MatchEntryOverlay key={matchSessionId} /> : null}
    </>
  );
};
