import { Box, Button, CircularProgress, FormGroup, Stack, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/MatchList";

export const Home = () => {
  const [{ id, activeMatches, isLogged }, { sendUserId }] = useTrucoshi();

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

  if (!isLogged) {
    return (
      <Stack alignItems="center" flexGrow={1}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
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
    </Stack>
  );
};
