import { PasswordOutlined } from "@mui/icons-material";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { User } from "lightning-accounts";
import { useUpdateProfile } from "../../api/hooks/useUpdateProfile";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../shared/LoadingButton";
import { Modal } from "../../shared/Modal";
import {
  getAccountErrorMessage,
  PASSWORD_MIN_LENGTH,
  validatePasswordPair,
} from "./accountValidation";
import { AccountSettingRow } from "./accountUi";

const PASSWORD_FORM_ID = "account-password-form";

export const PasswordSettings = ({
  account,
  open,
  onOpen,
  onClose,
}: {
  account: User;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const toast = useToast();
  const { updateProfile, isPending } = useUpdateProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const hasPassword = Boolean(account.hasPassword);
  const canConfigurePassword = Boolean(account.email);
  const passwordsMismatch = Boolean(confirmation && password !== confirmation);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setError("");
    }
  }, [open]);

  const close = () => {
    if (isPending) {
      return;
    }
    setError("");
    onClose();
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validatePasswordPair(password, confirmation);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (hasPassword && !currentPassword) {
      setError("La contraseña actual es requerida");
      return;
    }

    updateProfile(
      {
        password,
        currentPassword: hasPassword ? currentPassword : undefined,
      },
      {
        onSuccess: () => {
          toast.success(hasPassword ? "Contraseña actualizada" : "Contraseña agregada");
          onClose();
        },
        onError: (requestError) => setError(getAccountErrorMessage(requestError)),
      },
    );
  };

  return (
    <>
      <AccountSettingRow
        icon={<PasswordOutlined />}
        title="Contraseña"
        description={
          !account.email
            ? "Agregá un email para configurar una contraseña."
            : hasPassword
              ? "Configurada · Podés iniciar sesión con email y contraseña."
              : "Todavía no configuraste acceso con contraseña."
        }
        action={
          <Button
            color={hasPassword ? "inherit" : "warning"}
            disabled={!canConfigurePassword}
            onClick={onOpen}
            size="small"
            variant="outlined"
          >
            {hasPassword ? "Cambiar" : "Agregar"}
          </Button>
        }
        testId="account-password-setting"
      />

      <Modal
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={close}
        preventCloseOnBackdropClick={isPending}
        title={hasPassword ? "Cambiar contraseña" : "Agregar contraseña"}
        actions={
          <Stack direction="row" gap={1} justifyContent="flex-end" width="100%">
            <Button color="inherit" disabled={isPending} onClick={close}>
              Cancelar
            </Button>
            <LoadingButton
              color="warning"
              form={PASSWORD_FORM_ID}
              isLoading={isPending}
              type="submit"
              variant="contained"
            >
              Guardar contraseña
            </LoadingButton>
          </Stack>
        }
      >
        <Stack component="form" id={PASSWORD_FORM_ID} gap={1.5} onSubmit={submitPassword}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography color="text.secondary" variant="body2">
            Usá al menos {PASSWORD_MIN_LENGTH} caracteres.
          </Typography>
          {hasPassword ? (
            <TextField
              autoComplete="current-password"
              autoFocus
              disabled={isPending}
              fullWidth
              label="Contraseña actual"
              name="currentPassword"
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setError("");
              }}
              type="password"
              value={currentPassword}
            />
          ) : null}
          <TextField
            autoComplete="new-password"
            autoFocus={!hasPassword}
            disabled={isPending}
            fullWidth
            label="Nueva contraseña"
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            type="password"
            value={password}
          />
          <TextField
            autoComplete="new-password"
            disabled={isPending}
            error={passwordsMismatch}
            fullWidth
            helperText={passwordsMismatch ? "Las contraseñas no coinciden" : " "}
            label="Repetir contraseña"
            name="passwordConfirmation"
            onChange={(event) => {
              setConfirmation(event.target.value);
              setError("");
            }}
            type="password"
            value={confirmation}
          />
        </Stack>
      </Modal>
    </>
  );
};
