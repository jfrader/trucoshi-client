import { Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { MatchList } from "../components/game/MatchList";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { PageContainer } from "../shared/PageContainer";
import { ManageSearch } from "@mui/icons-material";

export const Matches = () => {
  const [{ publicMatches, isConnected }, { fetchPublicMatches }] = useTrucoshi();

  useEffect(() => {
    fetchPublicMatches();
  }, [fetchPublicMatches]);

  return (
    <PageContainer title="Buscar Partida" icon={<ManageSearch fontSize="large" />}>
      <Card>
        <CardContent>
          {isConnected ? (
            <MatchList
              matches={publicMatches}
              NoMatches={<Typography>No se encontraron partidas</Typography>}
              title={"Partidas Online"}
              onRefresh={fetchPublicMatches}
            />
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
