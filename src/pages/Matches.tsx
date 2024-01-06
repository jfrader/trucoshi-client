import { Typography } from "@mui/material";
import { useEffect } from "react";
import { MatchList } from "../components/MatchList";
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
      <MatchList
        matches={publicMatches}
        NoMatches={<Typography>No se encontraron partidas</Typography>}
        title={"Partidas Online"}
        onRefresh={fetchPublicMatches}
      />
    </PageLayout>
  );
};
