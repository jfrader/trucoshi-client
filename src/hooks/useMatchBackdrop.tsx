import { FC, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPublicMatch } from "trucoshi";
import { Backdrop } from "../components/Backdrop";

export const useMatchBackdrop = (): [(match?: IPublicMatch | null) => void, FC] => {
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  const onMatchLoad = useCallback((match?: IPublicMatch | null) => {
    if (!match) {
      return setOpen(true);
    }
  }, []);

  const MatchBackdrop = useCallback(
    () => (
      <Backdrop
        open={isOpen}
        onClick={() => navigate("/")}
        message="No se pudo encontrar la partida"
      />
    ),
    [isOpen, navigate]
  );

  return [onMatchLoad, MatchBackdrop];
};
