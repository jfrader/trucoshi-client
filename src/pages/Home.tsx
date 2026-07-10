import { Card, CardContent, Container, Slide, Stack } from "@mui/material";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/game/MatchList";
import { PlayMenu } from "../components/menu/PlayMenu";
import { WelcomeMenu } from "../components/menu/WelcomeMenu";
import { HomePromoTreasureOverlay } from "../components/reward/HomePromoTreasureOverlay";
import { HomeSeoDiscovery } from "../components/seo/SeoLandingPage";

export const Home = () => {
  const [{ activeMatches }] = useTrucoshi();
  const hasActiveMatches = activeMatches.length > 0;

  const WelcomeContent = (
    <Slide in direction="right">
      <Card>
        <CardContent>
          <WelcomeMenu />
        </CardContent>
      </Card>
    </Slide>
  );

  return (
    <>
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
              <Slide in direction="right" appear={false}>
                <Card>
                  <CardContent>
                    <PlayMenu eyebrow showNoticeBanner />
                  </CardContent>
                </Card>
              </Slide>
              {hasActiveMatches ? null : WelcomeContent}
            </Stack>
            {hasActiveMatches ? (
              <Stack
                flexGrow={1}
                gap={3}
                justifyContent="start"
                width="100%"
                maxWidth={{ md: "sm" }}
              >
                {WelcomeContent}
                <Slide in direction="left">
                  <Stack flexGrow={1} gap={2} width="100%" maxWidth={{ md: "sm" }}>
                    <Card sx={{ flexGrow: 1 }}>
                      <CardContent>
                        <MatchList dense matches={activeMatches} title="Partidas activas" />
                      </CardContent>
                    </Card>
                  </Stack>
                </Slide>
              </Stack>
            ) : null}
          </Stack>
          <HomeSeoDiscovery />
        </Stack>
      </Container>
      <HomePromoTreasureOverlay />
    </>
  );
};
