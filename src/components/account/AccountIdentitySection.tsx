import { BadgeOutlined, ImageOutlined } from "@mui/icons-material";
import { Alert, Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { User } from "lightning-accounts";
import { useUpdateProfile } from "../../api/hooks/useUpdateProfile";
import { useToast } from "../../hooks/useToast";
import { LoadingButton } from "../../shared/LoadingButton";
import { UserAvatar } from "../../shared/UserAvatar";
import { contentGutterSx } from "../layout/contentLayout";
import {
  getAccountErrorMessage,
  PLAYER_NAME_MAX_LENGTH,
  validatePlayerName,
} from "./accountValidation";
import { AccountInset, AccountPanel, AccountPanelHeader } from "./accountUi";

export const AccountIdentitySection = ({ account }: { account: User }) => {
  const toast = useToast();
  const { updateProfile, isPending } = useUpdateProfile();
  const [name, setName] = useState(account.name);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(account.name);
  }, [account.name]);

  const normalizedName = name.trim();
  const validationError = validatePlayerName(name);
  const unchanged = normalizedName === account.name;

  const submitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (validationError || unchanged) {
      setError(validationError);
      return;
    }

    updateProfile(
      { name: normalizedName },
      {
        onSuccess: () => toast.success("Nombre actualizado"),
        onError: (requestError) => setError(getAccountErrorMessage(requestError)),
      },
    );
  };

  return (
    <AccountPanel data-testid="account-identity-section">
      <AccountPanelHeader
        title="Identidad de jugador"
        description="El nombre y avatar que ven los demás en mesas, rankings y partidas."
      />
      <Box
        component="form"
        onSubmit={submitName}
        sx={(theme) => ({
          px: contentGutterSx,
          py: contentGutterSx,
          borderTop: `1px solid ${theme.trucoshiUi.account.divider}`,
        })}
      >
        <Stack gap={1.5}>
          <AccountInset
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              py: 1,
            }}
          >
            <UserAvatar size="medium" account={account} />
            <Box minWidth={0}>
              <Stack direction="row" alignItems="center" gap={0.6}>
                <ImageOutlined color="action" fontSize="small" />
                <Typography fontWeight={850} variant="body2">
                  Avatar público
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Se sincroniza desde tu método de acceso vinculado.
              </Typography>
            </Box>
          </AccountInset>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            autoComplete="nickname"
            disabled={isPending}
            fullWidth
            inputProps={{ maxLength: PLAYER_NAME_MAX_LENGTH }}
            label="Nombre de jugador"
            name="name"
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            value={name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Typography variant="caption" color="text.secondary">
              {name.length}/{PLAYER_NAME_MAX_LENGTH} caracteres
            </Typography>
            <LoadingButton
              color="warning"
              disabled={Boolean(validationError || unchanged)}
              isLoading={isPending}
              type="submit"
              variant="contained"
              sx={{ fontWeight: 900, px: 2.25 }}
            >
              Guardar nombre
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </AccountPanel>
  );
};
