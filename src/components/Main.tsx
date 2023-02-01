import { Box, Button, Container, Input } from "@mui/material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useTrucoshi } from "../hooks/useTrucoshi";

export const Main = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>("Satoshi");
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
    <Container>
      <Box py={8}>
        {isLogged && id ? (
          <Box>
            <Button variant="contained" color="success" onClick={onCreateMatch}>
              Crear Partida
            </Button>
            {/* <Button variant="contained" color="primary">
            Unirse a Partida
          </Button> */}
          </Box>
        ) : (
          <Box>
            <Input
              onChange={(e) => setName(e.target.value)}
              type="text"
              value={name}
              placeholder="Pone tu nombre"
            />
            <Button variant="contained" onClick={() => nameRef.current && sendUserId(name)}>
              Aceptar
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};
