import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormGroup,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/MatchList";
import { FlipGameCard, GameCardContainer } from "../components/GameCard";
import { HandContainer } from "../components/Rounds";
import { getRandomCards } from "../trucoshi/hooks/useCards";
import { Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import { ICard } from "trucoshi";

export const Home = () => {
  const [{ id, activeMatches, isLogged }, { sendUserId }, hydrated] = useTrucoshi();

  const [name, setName] = useState(id || "Satoshi");
  const [isNameLoading, setNameLoading] = useState(false);
  const [randomCards, setRandomCards] = useState<ICard[]>(getRandomCards());
  const [flip, setFlip] = useState(true);

  const [, { createMatch }] = useMatch();
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => setFlip(false), 750);
    return () => clearTimeout(timeout);
  }, []);

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

  const [openHand, setOpenHand] = useState<boolean>(false);

  if (!hydrated || !isLogged) {
    return (
      <Stack pt={2} alignItems="center" flexGrow={1}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Container maxWidth="sm">
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

        <Box height="8em" width="100%">
          <HandContainer
            onHandOpen={setOpenHand}
            pt={3}
            sx={{ position: "relative", left: "-2.5em", pt: 3 }}
          >
            {randomCards.map((card, i) => {
              return (
                <GameCardContainer key={card} open={openHand} cards={randomCards.length} i={i}>
                  <FlipGameCard flip={flip} zoom={openHand} card={card as ICard} />
                </GameCardContainer>
              );
            })}
            <Stack justifyContent="end" alignItems="end" pr={2}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setRandomCards(getRandomCards());
                }}
                size="large"
                color="primary"
              >
                <Refresh />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setFlip((c) => !c);
                }}
                size="large"
                color="success"
              >
                {flip ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Stack>
          </HandContainer>
        </Box>

        <Box pt={1}>
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
    </Container>
  );
};
