import {
  Box,
  Button,
  CircularProgress,
  FormGroup,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { MatchList } from "../components/MatchList";
import { GameCard, GameCardContainer } from "../components/GameCard";
import { HandContainer } from "../components/Rounds";
import { getRandomCard } from "../trucoshi/hooks/useCards";
import { Refresh } from "@mui/icons-material";
import { ICard } from "trucoshi";

const getRandomCards = (): [ICard, ICard, ICard] => [
  getRandomCard(),
  getRandomCard(),
  getRandomCard(),
];

export const Home = () => {
  const [{ id, activeMatches, isLogged }, { sendUserId }] = useTrucoshi();

  const [name, setName] = useState(id || "Satoshi");
  const [isNameLoading, setNameLoading] = useState(false);
  const [randomCards, setRandomCards] = useState<[ICard, ICard, ICard]>(getRandomCards());

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

  const [openHand, setOpenHand] = useState<boolean>(false);

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

      <Box height="8em" position="relative" right="2.65em">
        <HandContainer onHandOpen={setOpenHand} pt={3}>
          {randomCards.map((card, i) => (
            <GameCardContainer key={card} open={openHand} cards={3} i={i}>
              <GameCard card={card} />
            </GameCardContainer>
          ))}
        </HandContainer>

        <Box pl={42} pt={2}>
          <IconButton onClick={() => setRandomCards(getRandomCards())} size="large" color="success">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Box pt={2}>
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
