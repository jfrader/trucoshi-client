import { Container } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EMatchTableState } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshiAction } from "../hooks/useTrucoshiAction";
import { useTrucoshiState } from "../hooks/useTrucoshiState";
import { Table } from "./Table";

export const Match = () => {
  const { match, isLogged } = useTrucoshiState();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getMatch } = useTrucoshiAction();

  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId && isLogged) {
      getMatch(sessionId);
    }
  }, [getMatch, sessionId, isLogged]);

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  return (
    <Container>
      <Table />
    </Container>
  );
};
