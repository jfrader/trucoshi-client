import { CssBaseline, Paper, ThemeProvider, styled } from "@mui/material";
import { Box } from "@mui/system";
import { PropsWithChildren, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { themes } from "../../theme";
import { CardBackdrop } from "../../shared/CardBackdrop";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Topbar } from "./Topbar";
import { useQuery } from "@tanstack/react-query";
import { ConfirmationModal } from "../../shared/ConfirmationModal";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";

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

  const [{ inspectedCard, cardsReady, cardTheme, dark }, { inspectCard }] = useTrucoshi();

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
    if (versionCheck.data && versionCheck.data.version.trim() !== import.meta.env.APP_VERSION) {
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
      <CardBackdrop
        card={inspectedCard}
        cardsReady={cardsReady}
        inspectCard={inspectCard}
        cardTheme={cardTheme}
      />

      <ConfirmationModal {...modal} />
    </ThemeProvider>
  );
};
