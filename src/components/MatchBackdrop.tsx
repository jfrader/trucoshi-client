import { useNavigate } from "react-router-dom";
import { Backdrop } from "../components/Backdrop";

export const MatchBackdrop = ({ error }: { error: Error | null }) => {
  const navigate = useNavigate();

  return (
    <Backdrop
      mountOnEnter
      unmountOnExit
      open={Boolean(error)}
      onClick={() => navigate("/")}
      message={error && error.message ? error.message : "No se pudo encontrar la partida"}
    />
  );
};
