import { Button } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
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
      void navigate({
        to: "/lobby/$sessionId",
        params: { sessionId: match.matchSessionId },
      });
    });

  return (
    <Button size="large" onClick={onCreateMatch}>
      Crear Partida
    </Button>
  );
};
