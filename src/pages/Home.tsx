import { Card, CardContent, CircularProgress, Container, Stack } from "@mui/material";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/game/MatchList";
import { PlayMenu } from "../components/menu/PlayMenu";
import { WelcomeMenu } from "../components/menu/WelcomeMenu";

export const Home = () => {
  const [{ activeMatches, session, isAccountPending }, , hydrated] = useTrucoshi();

  if (!hydrated || !session || isAccountPending) {
    return (
      <Stack pt={8} alignItems="center" flexGrow={1}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Container>
      <Stack
        flexGrow={1}
        gap={3}
        pt={3}
        direction={{ xs: "column", md: "row" }}
        alignItems="start"
        justifyContent="center"
        width="100%"
      >
        <Stack flexGrow={1} gap={3} justifyContent="start" width="100%" maxWidth={{ md: "sm" }}>
          <Card>
            <CardContent>
              <PlayMenu />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <WelcomeMenu />
            </CardContent>
          </Card>
        </Stack>
        {activeMatches.length ? (
          <Stack flexGrow={1} gap={2} width="100%" maxWidth="sm">
            <Card>
              <CardContent>
                <MatchList dense matches={activeMatches} title="Partidas activas" />
              </CardContent>
            </Card>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
};
