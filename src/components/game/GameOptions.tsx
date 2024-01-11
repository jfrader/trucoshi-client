import { Button, IconButton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { ILobbyOptions } from "trucoshi";
import { SatoshiIcon } from "../../assets/icons/SatoshiIcon";
import { Check, Close } from "@mui/icons-material";

export const GameOptions = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues: ILobbyOptions;
  onSubmit(o: ILobbyOptions): void;
}) => {
  const [options, setOptions] = useState<ILobbyOptions>(defaultValues);

  return (
    <form
      onSubmit={(e) => {
        onSubmit(options);
        e.preventDefault();
      }}
    >
      <Stack gap={4} px={2} pt={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton
            title="Cancelar"
            onClick={() => setOptions((current) => ({ ...current, satsPerPlayer: 0 }))}
            color="warning"
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
          <TextField
            size="small"
            variant="outlined"
            label="Sats por Jugador"
            name="satsPerPlayer"
            autoComplete="off"
            color="warning"
            placeholder="Sats"
            onChange={(e) => {
              if (!e.target.value.match(/^[0-9]*\.?[0-9]*$/)) {
                return e.preventDefault();
              }
              setOptions((current) => ({ ...current, satsPerPlayer: Number(e.target.value) }));
            }}
            value={options.satsPerPlayer}
            InputProps={{
              endAdornment: <SatoshiIcon color="warning" />,
            }}
          />
          <IconButton title="Aceptar" type="submit" size="small">
            <Check fontSize="small" />
          </IconButton>
        </Stack>
        <Button type="submit" color="success">
          Guardar
        </Button>
      </Stack>
    </form>
  );
};
