import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
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
          <IconButton
            title="Cancelar"
            disabled={!options.satsPerPlayer}
            onClick={() => setOptions((current) => ({ ...current, satsPerPlayer: 0 }))}
            color="warning"
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
        <FormControl>
          <InputLabel id="maxPlayers-label">Jugadores</InputLabel>
          <Select
            size="small"
            labelId="maxPlayers-label"
            label="Jugadores"
            name="maxPlayers"
            value={options.maxPlayers}
            onChange={(e) => {
              if (!["2", "4", "6"].includes(e.target.value as string)) {
                return e.preventDefault();
              }
              setOptions((current) => ({
                ...current,
                maxPlayers: Number(e.target.value) as 2 | 4 | 6,
              }));
            }}
          >
            {[2, 4, 6].map((a) => (
              <MenuItem key={a} value={String(a)}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="matchPoint-label">Puntos por Etapa</InputLabel>
          <Select
            size="small"
            labelId="matchPoint-label"
            label="Puntos por Etapa"
            name="matchPoint"
            value={options.matchPoint}
            onChange={(e) => {
              if (!["9", "12", "15"].includes(e.target.value as string)) {
                return e.preventDefault();
              }
              setOptions((current) => ({
                ...current,
                matchPoint: Number(e.target.value) as 9 | 12 | 15,
              }));
            }}
          >
            {[9, 12, 15].map((a) => (
              <MenuItem key={a} value={String(a)}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
