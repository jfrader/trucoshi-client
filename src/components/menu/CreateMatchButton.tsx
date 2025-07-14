import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../../trucoshi/hooks/useMatch";
import { useToast } from "../../hooks/useToast";

export const CreateMatchButton = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [, { createMatch }] = useMatch();
  const onCreateMatch = () =>
    createMatch((e, match) => {
      if (e || !match) {
        return toast.error("Hubo un error al crear la partida...");
      }
      navigate(`/lobby/${match.matchSessionId}`);
    });

  return (
    <Button size="large" onClick={onCreateMatch}>
      Crear Partida
    </Button>
  );
};
