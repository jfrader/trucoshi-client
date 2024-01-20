import { Button, IconButton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { ILobbyOptions } from "trucoshi";
import { SatoshiIcon } from "../../assets/icons/SatoshiIcon";
import { Close } from "@mui/icons-material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

export const GameOptions = ({
  defaultValues,
  onSubmit,
  onClose,
}: {
  defaultValues: ILobbyOptions;
  onSubmit(o: ILobbyOptions): void;
  onClose(): void;
}) => {
  const [{ account }] = useTrucoshi();
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
            disabled={!options.satsPerPlayer}
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
            disabled={!account}
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
        </Stack>
        <Stack direction="row">
          <Button fullWidth color="error" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button fullWidth type="submit" color="success">
            Aceptar
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};
