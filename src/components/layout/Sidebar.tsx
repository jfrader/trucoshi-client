import { Box, Button, Card, CardContent, Slide, Stack } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { PlayMenu } from "../menu/PlayMenu";
import { WalletMenu } from "../menu/WalletMenu";
import { useNavigate } from "react-router-dom";
import { MatchList } from "../game/MatchList";

export const Sidebar = () => {
  const navigate = useNavigate();
  const [{ isSidebarOpen, account, activeMatches }, { logout }] = useTrucoshi();
  return (
    <Slide in={isSidebarOpen} direction="left">
      <Card
        sx={(theme) => ({
          zIndex: theme.zIndex.appBar + 1,
          position: "fixed",
          top: "50px",
          borderRadius: 0,
          right: 0,
          boxShadow: theme.shadows[6],
          pt: 1,
          px: 1,
          paddingBottom: "48px",
          height: "100vh",
          width: { xs: "98vw", sm: "20rem" },
        })}
      >
        <CardContent sx={{ display: "flex", direction: "column", height: "100%" }}>
          <Stack gap={3} height="100%" width="100%">
            <WalletMenu />
            <PlayMenu />
            <Box flexGrow={1} />
            {activeMatches.length ? (
              <MatchList dense matches={activeMatches} title="Partidas activas" />
            ) : null}
            {account ? (
              <Button fullWidth size="large" color="error" onClick={() => logout()}>
                Cerrar Sesion
              </Button>
            ) : (
              <Button color="success" fullWidth onClick={() => navigate(`/register`)}>
                Registrarse
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Slide>
  );
};
