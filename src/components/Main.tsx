import { Box, Button, TextField } from "@mui/material";
import { Container } from "@mui/system";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const Main = () => {
  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const [{ isLogged, id }, { sendUserId }] = useTrucoshi();
  const [name, setName] = useState(id || "Satoshi");

  const [, { createMatch }] = useMatch();
  const navigate = useNavigate();

  const onCreateMatch = () =>
    createMatch((e, match) => {
      if (e || !match) {
        return navigate("/");
      }
      navigate(`/lobby/${match.matchSessionId}`);
    });

  return (
    <Container>
      <Box p={4}>
        <Box>
          <TextField label="Nombre" onChange={onChangeName} type="text" value={name} />
        </Box>
        <Button variant="contained" onClick={() => name && sendUserId(name)}>
          {isLogged ? 'Cambiar' : 'Aceptar'}
        </Button>
      </Box>
      {isLogged ? (
        <Box p={4}>
          <Button variant="contained" color="success" onClick={onCreateMatch}>
            Crear Partida
          </Button>
          {/* <Button variant="contained" color="primary">
            Unirse a Partida
          </Button> */}
        </Box>
      ) : null}
    </Container>
  );
};
