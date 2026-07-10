import { Box, Button, Card, CardContent, CircularProgress, Slide, Stack } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useNavigate } from "@tanstack/react-router";
import { Topbar } from "./Topbar";
import StyleIcon from "@mui/icons-material/Style";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { lazy, Suspense } from "react";

const SidebarMainContent = lazy(() =>
  import("./SidebarMainContent").then((module) => ({ default: module.SidebarMainContent })),
);

const SIDEBAR_WIDTH = { xs: "100vw", sm: "24rem", md: "26rem" };

export const Sidebar = ({
  topOffset = "50px",
  showEmbeddedTopbar = false,
}: {
  topOffset?: string;
  showEmbeddedTopbar?: boolean;
}) => {
  const navigate = useNavigate();
  const [{ isSidebarOpen, account, activeMatches }, { logout, setSidebarOpen }] = useTrucoshi();

  const onMenuClick = () => setSidebarOpen(false);

  return (
    <>
      {isSidebarOpen ? (
        <Box
          aria-hidden="true"
          data-testid="sidebar-backdrop"
          onClick={onMenuClick}
          sx={(theme) => ({
            position: "fixed",
            inset: 0,
            zIndex: theme.zIndex.drawer + 1,
            background: "rgba(0, 0, 0, 0.34)",
            WebkitTapHighlightColor: "transparent",
          })}
        />
      ) : null}
      <Slide in={isSidebarOpen} direction="left" mountOnEnter unmountOnExit>
        <Card
          aria-modal={isSidebarOpen ? "true" : undefined}
          data-testid="sidebar-panel"
          role="dialog"
          sx={(theme) => ({
            zIndex: theme.zIndex.drawer + 2,
            position: "fixed",
            top: topOffset,
            right: 0,
            borderRadius: 0,
            boxShadow: theme.shadows[6],
            pt: showEmbeddedTopbar ? 0 : 1,
            px: 0,
            height: `calc(100dvh - ${topOffset})`,
            maxHeight: `calc(100dvh - ${topOffset})`,
            width: SIDEBAR_WIDTH,
            maxWidth: SIDEBAR_WIDTH,
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
              px={showEmbeddedTopbar ? 1 : 1.5}
              pt={showEmbeddedTopbar ? 0.25 : 0}
              pb="calc(env(safe-area-inset-bottom) + 1rem)"
              sx={{ height: "100%", minHeight: 0 }}
            >
              {showEmbeddedTopbar ? <Topbar embedded /> : null}
              <Stack
                data-testid="sidebar-scroll-area"
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
                <Suspense
                  fallback={
                    <Stack minHeight="12rem" alignItems="center" justifyContent="center">
                      <CircularProgress color="inherit" />
                    </Stack>
                  }
                >
                  <SidebarMainContent activeMatches={activeMatches} onMenuClick={onMenuClick} />
                </Suspense>
              </Stack>
              <Stack
                data-testid="sidebar-bottom-actions"
                gap={1}
                sx={() => ({
                  flex: "0 0 auto",
                  py: 1,
                })}
              >
                {account ? (
                  <>
                    {account.role === "ADMIN" ? (
                      <Button
                        fullWidth
                        size="large"
                        color="warning"
                        startIcon={<AdminPanelSettingsIcon />}
                        onClick={() => {
                          onMenuClick();
                          void navigate({ to: "/admin" });
                        }}
                      >
                        Admin
                      </Button>
                    ) : null}
                    <Button
                      fullWidth
                      size="large"
                      color="warning"
                      startIcon={<StyleIcon />}
                      onClick={() => {
                        onMenuClick();
                        void navigate({ to: "/inventory" });
                      }}
                    >
                      Inventario
                    </Button>
                    <Button fullWidth size="large" color="error" onClick={() => logout()}>
                      Cerrar Sesion
                    </Button>
                  </>
                ) : (
                  <Stack alignItems="center">
                    <Button
                      color="success"
                      variant="contained"
                      onClick={() => {
                        onMenuClick();
                        void navigate({ to: "/register" });
                      }}
                    >
                      Registrarse
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Slide>
    </>
  );
};
