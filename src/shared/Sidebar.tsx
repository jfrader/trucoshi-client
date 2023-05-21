import {
  Box,
  Button,
  CircularProgress,
  FormGroup,
  SwipeableDrawer,
  TextField,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

interface Props {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const Sidebar = ({ isOpen, setOpen }: Props) => {
  const [{ user }, { login }] = useTrucoshi();
  const [isLoading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    setLoading(true);
    login(username, password, () => setLoading(false));
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={isOpen}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      {user ? (
        <Box>
          <Typography>Bienvenido {user.username}</Typography>
        </Box>
      ) : (
        <Box>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            <FormGroup>
              <TextField
                label="Usuario"
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                value={username}
              />
              <TextField
                label="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                value={password}
              />
              <Button disabled={isLoading} color="warning" type="submit">
                {isLoading ? (
                  <Box>
                    <CircularProgress size={16} />
                  </Box>
                ) : (
                  "Iniciar Sesion"
                )}
              </Button>
            </FormGroup>
          </form>
        </Box>
      )}
    </SwipeableDrawer>
  );
};
