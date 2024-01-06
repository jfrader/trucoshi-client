import { CircularProgress, Container, Stack } from "@mui/material";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/MatchList";
import { ProfileMenu } from "../components/ProfileMenu";

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
        pt={2}
        direction={{ xs: "column", md: "row" }}
        alignItems="start"
        justifyContent="center"
        width="100%"
      >
        <Stack flexGrow={1} gap={2} justifyContent="start" width="100%" maxWidth="sm">
          <ProfileMenu />
        </Stack>
        {activeMatches.length ? (
          <Stack flexGrow={1} gap={2} width="100%" maxWidth="sm">
            <MatchList dense matches={activeMatches} title="Partidas activas" />
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
};
