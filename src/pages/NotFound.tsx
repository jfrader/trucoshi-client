import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link } from "../shared/Link";
import { GameCard } from "../components/card/GameCard";
import { BURNT_CARD, ICard } from "trucoshi";
import { KeyboardBackspace } from "@mui/icons-material";

const NumberedCard = ({ card = BURNT_CARD, n = "" }: { card?: ICard; n?: string | number }) => {
  return (
    <Stack position="relative">
      <GameCard width="9em" card={card} />
      <Typography
        sx={{
          color: "black",
          opacity: 0.5,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        variant="h2"
      >
        {n}
      </Typography>
    </Stack>
  );
};

export const NotFound = () => {
  return (
    <Container>
      <Box pt={4}>
        <Typography component="h1" mb={2} variant="h4" letterSpacing="-2px">
          NOT FOUND
        </Typography>

        <Stack alignItems="center" justifyContent="center" direction="row">
          <NumberedCard card="4o" />
          <NumberedCard />
          <NumberedCard card="4e" />
        </Stack>
        <Typography my={10}>Esta pagina no existe.</Typography>

        <Button startIcon={<KeyboardBackspace />} variant="contained" component={Link} to="/">
          Al Inicio
        </Button>
      </Box>
    </Container>
  );
};
