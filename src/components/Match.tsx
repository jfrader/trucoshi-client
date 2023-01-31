import { Container } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EMatchTableState } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshiMatch } from "../hooks/useTrucoshiMatch";
import { useTrucoshiState } from "../hooks/useTrucoshiState";
import { Table } from "./Table";

export const Match = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { session } = useTrucoshiState();
  const [match, isMyTurn, { playCard }] = useTrucoshiMatch(sessionId);

  const navigate = useNavigate();

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
      <Table match={match} onPlayCard={playCard} session={session} isMyTurn={isMyTurn} />
    </Container>
  );
};
