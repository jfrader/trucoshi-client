import { useRef } from "react";
import { useTrucoshiAction } from "../hooks/useTrucoshiAction";
import { useTrucoshiState } from "../hooks/useTrucoshiState";
import { useNavigate } from "react-router-dom";

export const Main = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const { isLogged, session } = useTrucoshiState();
  const { createMatch, sendUserId } = useTrucoshiAction();
  const navigate = useNavigate();

  const onCreateMatch = () =>
    createMatch((e) => {
      if (e) {
        console.error(e)
        return navigate("/");
      }
      navigate(`/lobby/${session}`);
    });

  return (
    <div>
      {isLogged ? (
        <div>
          <button onClick={onCreateMatch}>Crear Partida</button>
          <button>Unirse a Partida</button>
        </div>
      ) : (
        <p>
          <input ref={nameRef} type="text" placeholder="Type your name" />
          <button onClick={() => nameRef.current && sendUserId(nameRef.current.value)}>
            Aceptar
          </button>
        </p>
      )}
    </div>
  );
};
