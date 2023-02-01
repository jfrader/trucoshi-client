import { Box, Button } from "@mui/material";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useTrucoshi } from "../hooks/useTrucoshi";

export const Main = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const [{ isLogged, session, id }, { sendUserId }] = useTrucoshi();

  const [, { createMatch }] = useMatch(session);
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
          <Button variant="contained" color="success" onClick={onCreateMatch}>
            Crear Partida
          </Button>
          <Button variant="contained" color="primary">
            Unirse a Partida
          </Button>
        </div>
      ) : (
        <Box>
          <Box>
            <input ref={nameRef} type="text" placeholder="Type your name" />
          </Box>
          <Button
            variant="contained"
            onClick={() => nameRef.current && sendUserId(nameRef.current.value)}
          >
            Aceptar
          </Button>
        </Box>
      )}
    </div>
  );
};
