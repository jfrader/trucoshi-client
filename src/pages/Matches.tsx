import { Card, CardContent, Typography } from "@mui/material";
import { useEffect } from "react";
import { MatchList } from "../components/game/MatchList";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { PageLayout } from "../shared/PageLayout";
import { ManageSearch } from "@mui/icons-material";

export const Matches = () => {
  const [{ publicMatches }, { fetchPublicMatches }] = useTrucoshi();
  useEffect(() => {
    fetchPublicMatches();
  }, [fetchPublicMatches]);
  return (
    <PageLayout title="Buscar Partida" icon={<ManageSearch fontSize="large" />}>
      <Card>
        <CardContent>
          <MatchList
            matches={publicMatches}
            NoMatches={<Typography>No se encontraron partidas</Typography>}
            title={"Partidas Online"}
            onRefresh={fetchPublicMatches}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
};
