import { Box, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { MatchList } from "../components/MatchList";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const Matches = () => {
  const [{ publicMatches }, { fetchPublicMatches }] = useTrucoshi();
  useEffect(() => {
    fetchPublicMatches();
  }, [fetchPublicMatches]);
  return (
    <Box component={Container} pt={4}>
      <MatchList
        matches={publicMatches}
        NoMatches={<Typography>No se encontraron partidas</Typography>}
        title={"Partidas Online"}
      />
    </Box>
  );
};
