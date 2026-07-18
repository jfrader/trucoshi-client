import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../../trucoshi/hooks/useMatch";
import { useGameAdmission } from "../../trucoshi/hooks/useGameAdmission";

export const CreateMatchButton = () => {
  const navigate = useNavigate();
  const [, { createMatch }] = useMatch();
  const { canStartNewGames } = useGameAdmission();
  const onCreateMatch = () =>
    createMatch((e, match) => {
      if (e || !match) {
        return;
      }
      navigate(`/lobby/${match.matchSessionId}`);
    });

  return (
    <Button disabled={!canStartNewGames} size="large" onClick={onCreateMatch}>
      {canStartNewGames ? "Crear Partida" : "Partidas en pausa"}
    </Button>
  );
};
