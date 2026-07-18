import { Alert, Button, lighten, Stack, TextField } from "@mui/material";
import { useCallback } from "react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
  <Alert
    severity={message.includes("Anota y guarda") ? "warning" : "error"}
    sx={{ fontSize: "1.1rem", fontWeight: "medium", width: "100%" }}
  >
    {message}
  </Alert>
);

interface SeedDisplayProps {
  seedPhrase: string;
  errors: string[] | Error[];
  onConfirm: () => void;
  onCancel?: () => void;
}

export const SeedDisplay = ({ seedPhrase, errors, onConfirm, onCancel }: SeedDisplayProps) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    if (onCancel) onCancel();
  }, [onCancel]);

  const errorMessages = errors
    .filter(Boolean)
    .map((error) => (error instanceof Error ? error.message : error))
    .map((message) => (
      <Alert
        key={message}
        severity={message.includes("Anota y guarda") ? "warning" : "error"}
        sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
      >
        {message}
      </Alert>
    ));

  return (
    <Stack gap={2}>
      {errorMessages}
      <TextField
        value={seedPhrase}
        variant="outlined"
        color="warning"
        InputProps={{
          readOnly: true,
          sx: (theme) => ({
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: "0.05em",
            backgroundColor: lighten(theme.palette.warning.light, 0.3),
            color: theme.palette.background.paper,
            borderRadius: "8px",
          }),
        }}
        fullWidth
      />
      <Button
        onClick={handleConfirm}
        color="success"
        variant="contained"
        size="large"
        sx={{ fontWeight: "bold" }}
      >
        Confirmar y Continuar
      </Button>
      {onCancel && (
        <Button
          onClick={handleCancel}
          color="error"
          variant="outlined"
          size="large"
          sx={{ fontWeight: "bold" }}
        >
          Cancelar
        </Button>
      )}
    </Stack>
  );
};
