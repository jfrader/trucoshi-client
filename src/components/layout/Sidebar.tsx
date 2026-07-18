import { Box, Button, Card, CardContent, Slide, Stack } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { PlayMenu } from "../menu/PlayMenu";
import { WalletMenu } from "../menu/WalletMenu";
import { useNavigate } from "react-router-dom";
import { MatchList } from "../game/MatchList";
import { Topbar } from "./Topbar";

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
    <Slide in={isSidebarOpen} direction="left">
      <Card
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer,
          position: "fixed",
          top: topOffset,
          borderRadius: 0,
          right: 0,
          boxShadow: theme.shadows[6],
          pt: showEmbeddedTopbar ? 0 : 1,
          px: 0,
          paddingBottom: "48px",
          height: "100vh",
          width: { xs: "100vw", sm: "24rem", md: "26rem" },
          maxWidth: { xs: "100vw", sm: "24rem", md: "26rem" },
        })}
      >
        <CardContent
          sx={{
            p: 0,
            "&:last-child": { pb: 0 },
            display: "flex",
            direction: "column",
            height: "100%",
          }}
        >
          <Stack gap={3} height="100%" width="100%" px={showEmbeddedTopbar ? 1 : 1.5} pt={showEmbeddedTopbar ? 0.25 : 0}>
            {showEmbeddedTopbar ? <Topbar embedded /> : null}
            <WalletMenu />
            <PlayMenu onMenuClick={onMenuClick} />
            <Box flexGrow={1} />
            {activeMatches.length ? (
              <MatchList dense matches={activeMatches} title="Partidas activas" />
            ) : null}
            {account ? (
              <Button fullWidth size="large" color="error" onClick={() => logout()}>
                Cerrar Sesion
              </Button>
            ) : (
              <Button
                color="success"
                fullWidth
                onClick={() => {
                  onMenuClick();
                  navigate(`/register`);
                }}
              >
                Registrarse
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Slide>
  );
};
