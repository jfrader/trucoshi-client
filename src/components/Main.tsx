import { useRef } from "react";
import { useTrucoshiState } from "../hooks/useTrucoshiState";
import { useNavigate } from "react-router-dom";
import { useTrucoshiMatch } from "../hooks/useTrucoshiMatch";
import { useTrucoshiAction } from "../hooks/useTrucoshiAction";

export const Main = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const { isLogged, session, id } = useTrucoshiState();

  const { sendUserId } = useTrucoshiAction();
  const [, , { createMatch }] = useTrucoshiMatch(session);
  const navigate = useNavigate();

  const onCreateMatch = () =>
    createMatch((e) => {
      if (e) {
        console.error(e);
        return navigate("/");
      }
      navigate(`/lobby/${session}`);
    });

  return (
    <div>
      {isLogged && id ? (
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
