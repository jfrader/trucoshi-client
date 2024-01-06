import {
  Box,
  Button,
  Card,
  CardContent,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { ChangeEvent, useState } from "react";
import { LoadingButton } from "./LoadingButton";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { SatoshiIcon } from "../assets/icons/SatoshiIcon";

export const ProfileMenu = () => {
  const navigate = useNavigate();
  const [{ name, account }, { sendUserId, logout }] = useTrucoshi();

  const [, { createMatch }] = useMatch();
  const onCreateMatch = () =>
    createMatch((e, match) => {
      if (e || !match) {
        return navigate("/");
      }
      navigate(`/lobby/${match.matchSessionId}`);
    });

  const [nameField, setNameField] = useState(name || "Satoshi");
  const [isNameLoading, setNameLoading] = useState(false);
  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setNameField(event.target.value);
  };

  const onClickChangeName = () => {
    setNameLoading(true);
    nameField && sendUserId(nameField, () => setNameLoading(false));
  };

  return (
    <Stack gap={3}>
      <Card>
        <CardContent>
          <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center">
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
              <Button size="large" onClick={onCreateMatch}>
                Crear Partida
              </Button>
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
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center">
            <Stack direction="row" justifyContent="space-between">
              <Typography
                textAlign="left"
                color="text.disabled"
                textTransform="uppercase"
                variant="subtitle1"
                paragraph
              >
                Bienvenido
              </Typography>
              {account ? (
                <Box>
                  <Typography color="text.disabled" textTransform="uppercase">
                    Balance
                  </Typography>
                  <Button color="inherit" endIcon={<SatoshiIcon />}>
                    <Typography>{account.wallet?.balanceInSats || 0}</Typography>
                  </Button>
                </Box>
              ) : null}
            </Stack>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onClickChangeName();
              }}
            >
              <FormGroup sx={{ pt: 2 }}>
                <TextField
                  color="warning"
                  label="Nombre"
                  onChange={onChangeName}
                  type="text"
                  value={nameField}
                />
                {account ? (
                  <Stack direction="row" justifyContent="center">
                    <LoadingButton
                      type="submit"
                      fullWidth
                      isLoading={isNameLoading}
                      disabled={nameField === name}
                      color="warning"
                    >
                      Cambiar Nombre
                    </LoadingButton>
                    <Button fullWidth size="large" color="error" onClick={() => logout()}>
                      Cerrar Sesion
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" justifyContent="center">
                    <LoadingButton
                      type="submit"
                      fullWidth
                      isLoading={isNameLoading}
                      disabled={nameField === name}
                      color="warning"
                    >
                      Cambiar Nombre
                    </LoadingButton>
                    <Button
                      color="success"
                      fullWidth
                      onClick={() =>
                        navigate(`/register?name=${nameField !== "Satoshi" ? nameField : ""}`)
                      }
                    >
                      Registrarse
                    </Button>
                  </Stack>
                )}
              </FormGroup>
            </form>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};
