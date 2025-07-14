import { Box, Button, FormGroup, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CreateMatchButton } from "./CreateMatchButton";

export const PlayMenu = () => {
  const navigate = useNavigate();
  const [{ account }] = useTrucoshi();

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Typography
        width="100%"
        textAlign="left"
        color="text.disabled"
        textTransform="uppercase"
        variant="subtitle1"
      >
        Jugar
      </Typography>
      <FormGroup>
        <CreateMatchButton />
        <Button color="secondary" size="large" onClick={() => navigate("/matches")}>
          Buscar Partida
        </Button>
        {account ? null : (
          <Button size="large" color="info" onClick={() => navigate("/login")}>
            Iniciar Sesion
          </Button>
        )}
      </FormGroup>
    </Box>
  );
};
