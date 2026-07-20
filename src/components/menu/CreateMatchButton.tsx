import { Button, type ButtonProps } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../../trucoshi/hooks/useMatch";
import { useGameAdmission } from "../../trucoshi/hooks/useGameAdmission";

export const CreateMatchButton = ({
  children = "Crear Partida",
  ...props
}: Omit<ButtonProps, "onClick">) => {
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
    <Button
      {...props}
      disabled={props.disabled || !canStartNewGames}
      size={props.size || "large"}
      onClick={onCreateMatch}
    >
      {canStartNewGames ? children : "Partidas en pausa"}
    </Button>
  );
};
