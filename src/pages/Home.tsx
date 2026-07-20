import { CardContent, Container, Slide, Stack } from "@mui/material";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/game/MatchList";
import { PlayMenu } from "../components/menu/PlayMenu";
import { WelcomeMenu } from "../components/menu/WelcomeMenu";
import { HomePanel } from "../components/home/HomePanel";
import { HomeMenuSkeleton } from "../components/home/HomeMenuSkeleton";

export const Home = () => {
  const [{ activeMatches, isConnected, isLoggingIn }, , , hydrated] = useTrucoshi();
  const hasActiveMatches = activeMatches.length > 0;
  const isHomeReady = hydrated && isConnected && !isLoggingIn;

  const welcomeContent = isHomeReady ? (
    <Slide in direction="right">
      <HomePanel role="region" elevation={0} aria-label="Cuenta">
        <CardContent>
          <WelcomeMenu />
        </CardContent>
      </HomePanel>
    </Slide>
  ) : (
    <HomePanel role="region" elevation={0} aria-label="Cargando cuenta" aria-busy>
      <CardContent>
        <HomeMenuSkeleton variant="welcome" />
      </CardContent>
    </HomePanel>
  );

  const playContent = isHomeReady ? (
    <Slide in direction="right" appear={false}>
      <HomePanel role="region" elevation={0} aria-label="Jugar">
        <CardContent>
          <PlayMenu eyebrow />
        </CardContent>
      </HomePanel>
    </Slide>
  ) : (
    <HomePanel role="region" elevation={0} aria-label="Cargando menú de juego" aria-busy>
      <CardContent>
        <HomeMenuSkeleton variant="play" />
      </CardContent>
    </HomePanel>
  );

  return (
    <Container maxWidth="xl" sx={{ width: { xs: "100vw", sm: "100%" } }}>
      <Stack
        sx={(theme) => ({
          width: "100%",
          maxWidth: hasActiveMatches ? "100%" : theme.breakpoints.values.sm,
          marginInline: "auto",
        })}
      >
        <Stack
          gap={3}
          pt={3}
          direction={{ xs: "column", md: "row" }}
          alignItems="stretch"
          justifyContent="center"
          width="100%"
        >
          <Stack flexGrow={1} gap={3} justifyContent="start" width="100%" maxWidth={{ md: "sm" }}>
            {hasActiveMatches ? null : welcomeContent}
            {playContent}
          </Stack>
          {hasActiveMatches ? (
            <Stack flexGrow={1} gap={3} justifyContent="start" width="100%" maxWidth={{ md: "sm" }}>
              {welcomeContent}
              <Slide in direction="left">
                <HomePanel role="region" elevation={0} aria-label="Partidas activas">
                  <CardContent>
                    <MatchList dense matches={activeMatches} title="Partidas activas" />
                  </CardContent>
                </HomePanel>
              </Slide>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
};
