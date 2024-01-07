import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { ChangeEvent, useState } from "react";
import { Box, Button, FormGroup, Stack, TextField, Typography } from "@mui/material";
import { LoadingButton } from "../../shared/LoadingButton";
import { Sats } from "../../shared/Sats";

export const WelcomeMenu = () => {
  const navigate = useNavigate();
  const [{ name, account }, { sendUserId, logout }] = useTrucoshi();

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
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Stack direction="row" justifyContent="space-between">
        <Typography
          textAlign="left"
          color="text.disabled"
          textTransform="uppercase"
          variant="subtitle1"
        >
          Bienvenido
        </Typography>
        {account ? (
          <Box>
            <Typography color="text.disabled" textTransform="uppercase">
              Balance
            </Typography>
            <Sats amount={account.wallet?.balanceInSats || 0} />
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
            size="small"
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
  );
};
