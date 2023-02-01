import { Box, Button, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useTrucoshi } from "../hooks/useTrucoshi";

export const Main = () => {
  const [name, setName] = useState("Cat in the Hat");
  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
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
            <TextField label="Nombre" onChange={onChangeName} type="text" />
          </Box>
          <Button variant="contained" onClick={() => name && sendUserId(name)}>
            Aceptar
          </Button>
        </Box>
      )}
    </div>
  );
};
