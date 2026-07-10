import { useNavigate } from "@tanstack/react-router";
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
      onClick={() => void navigate({ to: "/" })}
      message={error && error.message ? error.message : "No se pudo encontrar la partida"}
      {...props}
    />
  );
};
