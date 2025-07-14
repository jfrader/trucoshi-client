import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { MatchList } from "../components/game/MatchList";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { PageContainer } from "../shared/PageContainer";
import { ManageSearch } from "@mui/icons-material";
import { CreateMatchButton } from "../components/menu/CreateMatchButton";

export const Matches = () => {
  const [{ publicMatches, isConnected }, { fetchPublicMatches }] = useTrucoshi();

  useEffect(() => {
    fetchPublicMatches();
  }, [fetchPublicMatches]);

  return (
    <PageContainer title="Buscar Partida" icon={<ManageSearch fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack gap={4}>
            {isConnected ? (
              <MatchList
                matches={publicMatches}
                NoMatches={<Typography pl={1}>No se encontraron partidas</Typography>}
                title={"Partidas Online"}
                onRefresh={fetchPublicMatches}
              />
            ) : null}
            <CreateMatchButton />
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
