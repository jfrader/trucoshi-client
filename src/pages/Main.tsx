import { Box, Button, CircularProgress, FormGroup, Stack, TextField } from "@mui/material";
import { Container } from "@mui/system";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { MatchList } from "../components/MatchList";
import { TrucoshiText } from "../components/TrucoshiText";

export const Main = () => {
  const [{ isLogged, id, activeMatches }, { sendUserId }] = useTrucoshi();

  const [name, setName] = useState(id || "Satoshi");
  const [isNameLoading, setNameLoading] = useState(false);

  const [, { createMatch }] = useMatch();
  const navigate = useNavigate();

  const onCreateMatch = () =>
    createMatch((e, match) => {
      if (e || !match) {
        return navigate("/");
      }
      navigate(`/lobby/${match.matchSessionId}`);
    });

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onClickChangeName = () => {
    setNameLoading(true);
    name && sendUserId(name, () => setNameLoading(false));
  };

  return (
    <Container maxWidth="sm">
      <SocketBackdrop message="Conectando..." />
      <Box p={4} display="flex" flexDirection="column" flexGrow={1} height="100%">
        <Box pt={4} pb={4} maxWidth="100%">
          <TrucoshiText width="100%" style={{ objectFit: "contain" }} />
        </Box>
        {isLogged ? (
          <Stack flexGrow={1} spacing={2}>
            <Button size="large" color="primary" variant="outlined" onClick={onCreateMatch}>
              Crear Partida
            </Button>
            <Button
              size="large"
              color="secondary"
              variant="outlined"
              onClick={() => navigate("/matches")}
            >
              Ver Mesas
            </Button>
          </Stack>
        ) : null}
        <Box pt={6}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onClickChangeName();
            }}
          >
            <FormGroup>
              <TextField
                color="warning"
                label="Nombre"
                onChange={onChangeName}
                type="text"
                value={name}
              />
              <Button disabled={isNameLoading || name === id} color="warning" type="submit">
                {isNameLoading ? (
                  <Box>
                    <CircularProgress size={16} />
                  </Box>
                ) : (
                  "Cambiar Nombre"
                )}
              </Button>
            </FormGroup>
          </form>
        </Box>
        <Box pt={2}>
          {activeMatches.length ? (
            <MatchList matches={activeMatches} title="Partidas activas" />
          ) : null}
        </Box>
      </Box>
    </Container>
  );
};
