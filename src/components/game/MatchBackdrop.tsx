import { useNavigate } from "react-router-dom";
import { Backdrop, TrucoshiBackdropProps } from "../../shared/Backdrop";

export const MatchBackdrop = ({
  error,
  ...props
}: Omit<TrucoshiBackdropProps<{ error: Error | null }>, "open">) => {
  const navigate = useNavigate();

  return (
    <Backdrop
      mountOnEnter
      unmountOnExit
      open={Boolean(error)}
      onClick={() => navigate("/")}
      message={error && error.message ? error.message : "No se pudo encontrar la partida"}
      {...props}
    />
  );
};
