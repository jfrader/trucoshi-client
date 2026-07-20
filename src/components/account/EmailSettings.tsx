import { AlternateEmailOutlined, LockOutlined } from "@mui/icons-material";
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
  validateEmail,
  validatePasswordPair,
} from "./accountValidation";
import { AccountSettingRow } from "./accountUi";

const EMAIL_FORM_ID = "account-email-form";

export const EmailSettings = ({
  account,
  open,
  onOpen,
  onClose,
  onRequestPassword,
}: {
  account: User;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRequestPassword: () => void;
}) => {
  const toast = useToast();
  const { updateProfile, isPending } = useUpdateProfile();
  const [email, setEmail] = useState(account.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const hasEmail = Boolean(account.email);
  const canChangeExistingEmail = !hasEmail || Boolean(account.hasPassword);
  const normalizedEmail = email.trim();
  const passwordsMismatch = Boolean(confirmation && password !== confirmation);

  useEffect(() => {
    if (open) {
      setEmail(account.email || "");
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setError("");
    }
  }, [account.email, open]);

  const close = () => {
    if (isPending) {
      return;
    }
    setError("");
    onClose();
  };

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (normalizedEmail === account.email) {
      setError("Ingresa un email diferente al actual");
      return;
    }
    if (hasEmail && !currentPassword) {
      setError("La contraseña actual es requerida");
      return;
    }
    if (!hasEmail) {
      const passwordError = validatePasswordPair(password, confirmation);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    updateProfile(
      {
        email: normalizedEmail,
        password: hasEmail ? undefined : password,
        currentPassword: hasEmail ? currentPassword : undefined,
      },
      {
        onSuccess: () => {
          toast.success(hasEmail ? "Email actualizado" : "Email y contraseña agregados");
          onClose();
        },
        onError: (requestError) => setError(getAccountErrorMessage(requestError)),
      },
    );
  };

  return (
    <>
      <AccountSettingRow
        icon={<AlternateEmailOutlined />}
        title="Email"
        description={
          account.email
            ? canChangeExistingEmail
              ? account.email
              : `${account.email} · Agregá una contraseña antes de cambiarlo.`
            : "Agregá un email y contraseña para recuperar tu acceso."
        }
        action={
          canChangeExistingEmail ? (
            <Button color="inherit" onClick={onOpen} size="small" variant="outlined">
              {hasEmail ? "Cambiar" : "Agregar"}
            </Button>
          ) : (
            <Button
              color="warning"
              onClick={onRequestPassword}
              size="small"
              startIcon={<LockOutlined />}
              variant="outlined"
            >
              Proteger
            </Button>
          )
        }
        testId="account-email-setting"
      />

      <Modal
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={close}
        preventCloseOnBackdropClick={isPending}
        title={hasEmail ? "Cambiar email" : "Agregar email"}
        actions={
          <Stack direction="row" gap={1} justifyContent="flex-end" width="100%">
            <Button color="inherit" disabled={isPending} onClick={close}>
              Cancelar
            </Button>
            <LoadingButton
              color="warning"
              form={EMAIL_FORM_ID}
              isLoading={isPending}
              type="submit"
              variant="contained"
            >
              Guardar email
            </LoadingButton>
          </Stack>
        }
      >
        <Stack component="form" id={EMAIL_FORM_ID} gap={1.5} onSubmit={submitEmail}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            autoComplete="email"
            autoFocus
            disabled={isPending}
            fullWidth
            label={hasEmail ? "Nuevo email" : "Email"}
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            type="email"
            value={email}
          />
          {hasEmail ? (
            <TextField
              autoComplete="current-password"
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
          ) : (
            <>
              <Typography color="text.secondary" variant="body2">
                Crea también una contraseña de al menos {PASSWORD_MIN_LENGTH} caracteres.
              </Typography>
              <TextField
                autoComplete="new-password"
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
            </>
          )}
        </Stack>
      </Modal>
    </>
  );
};
