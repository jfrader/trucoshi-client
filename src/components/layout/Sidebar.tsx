import { Box, Button, Card, CardContent, Fade, Slide, Stack } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { PlayMenu } from "../menu/PlayMenu";
import { WalletMenu } from "../menu/WalletMenu";
import { useNavigate } from "react-router-dom";
import { MatchList } from "../game/MatchList";
import { HelpOutlineRounded, ManageAccounts } from "@mui/icons-material";
import { useEffect } from "react";

const APP_VIEWPORT_HEIGHT = "var(--trucoshi-viewport-height, 100dvh)";

export const Sidebar = ({ gameSurface = false }: { gameSurface?: boolean }) => {
  const navigate = useNavigate();
  const [{ isSidebarOpen, account, activeMatches }, { logout, setSidebarOpen }] = useTrucoshi();

  const onMenuClick = () => setSidebarOpen(false);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen, setSidebarOpen]);

  return (
    <>
      <Fade in={isSidebarOpen} mountOnEnter unmountOnExit timeout={160}>
        <Box
          aria-hidden="true"
          onClick={onMenuClick}
          sx={(theme) => ({
            position: "fixed",
            inset: 0,
            zIndex: theme.zIndex.drawer + 1,
            background: theme.trucoshiUi.navigation.drawerBackdrop,
            WebkitTapHighlightColor: "transparent",
          })}
        />
      </Fade>
      <Slide in={isSidebarOpen} direction="left" mountOnEnter unmountOnExit>
        <Card
          component="aside"
          aria-label="Navegación principal"
          data-trucoshi-overlay={isSidebarOpen ? "open" : undefined}
          sx={(theme) => ({
            zIndex: theme.zIndex.drawer + 2,
            position: "fixed",
            inset: "0 0 auto auto",
            borderRadius: 0,
            boxShadow: theme.shadows[6],
            boxSizing: "border-box",
            px: 0,
            height: APP_VIEWPORT_HEIGHT,
            maxHeight: APP_VIEWPORT_HEIGHT,
            width: {
              xs: "100vw",
              sm: theme.trucoshiUi.navigation.drawerWidthSmall,
              md: theme.trucoshiUi.navigation.drawerWidthMedium,
            },
            maxWidth: "100vw",
            overflow: "hidden",
          })}
        >
          <CardContent
            sx={{
              p: 0,
              "&:last-child": { pb: 0 },
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
            }}
          >
            <Stack
              gap={2.4}
              width="100%"
              pb="calc(env(safe-area-inset-bottom) + 1rem)"
              sx={(theme) => ({
                boxSizing: "border-box",
                height: "100%",
                minHeight: 0,
                px: theme.trucoshiUi.navigation.edgeInset,
                pt: gameSurface
                  ? theme.trucoshiUi.navigation.gameBarHeight
                  : {
                      xs: theme.trucoshiUi.navigation.appBarHeightMobile,
                      md: theme.trucoshiUi.navigation.appBarHeightDesktop,
                    },
              })}
            >
              <Stack
                gap={2.4}
                sx={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  pr: 0.25,
                  pt: 1,
                }}
              >
                <WalletMenu />
                <PlayMenu onMenuClick={onMenuClick} />
                {activeMatches.length ? (
                  <MatchList dense matches={activeMatches} title="Partidas activas" />
                ) : null}
              </Stack>
              <Stack gap={1} sx={{ flex: "0 0 auto", py: 1 }}>
                <Button
                  fullWidth
                  size="large"
                  color="info"
                  startIcon={<HelpOutlineRounded />}
                  onClick={() => {
                    onMenuClick();
                    navigate("/help");
                  }}
                >
                  Ayuda
                </Button>
                {account ? (
                  <>
                    <Button
                      fullWidth
                      size="large"
                      color="warning"
                      startIcon={<ManageAccounts />}
                      onClick={() => {
                        onMenuClick();
                        navigate("/account");
                      }}
                    >
                      Mi cuenta
                    </Button>
                    <Button
                      fullWidth
                      size="large"
                      color="error"
                      onClick={() => {
                        onMenuClick();
                        logout();
                      }}
                    >
                      Cerrar Sesion
                    </Button>
                  </>
                ) : (
                  <Button
                    color="success"
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      onMenuClick();
                      navigate("/register");
                    }}
                  >
                    Registrarse
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Slide>
    </>
  );
};
