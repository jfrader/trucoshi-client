import { ContentCopyOutlined, KeyOutlined } from "@mui/icons-material";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import type { User } from "lightning-accounts";
import { useQueryClient } from "@tanstack/react-query";
import { useSetSeed } from "../../api/hooks/useSetSeed";
import { LoadingButton } from "../../shared/LoadingButton";
import { Modal } from "../../shared/Modal";
import { getAccountErrorMessage } from "./accountValidation";
import { AccountInset, AccountSettingRow } from "./accountUi";

export const SeedPhraseSettings = ({ account }: { account: User }) => {
  const queryClient = useQueryClient();
  const { setSeed, isPending } = useSetSeed();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const hasSeed = Boolean(account.hasSeed);
  const canRegenerate = !hasSeed || Boolean(account.email || account.twitter);

  const generateSeed = () => {
    setError("");
    setSeed(undefined, {
      onSuccess: ({ seedPhrase: generatedPhrase }) => {
        setConfirmationOpen(false);
        setSeedPhrase(generatedPhrase || "");
        setCopied(false);
      },
      onError: (requestError) => setError(getAccountErrorMessage(requestError)),
    });
  };

  const copySeed = async () => {
    if (!seedPhrase || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
  };

  return (
    <>
      <AccountSettingRow
        icon={<KeyOutlined />}
        title="Frase de recuperación"
        description={
          !hasSeed
            ? "Generá una frase secreta para recuperar el acceso a tu cuenta."
            : canRegenerate
              ? "Configurada · Regenerarla reemplaza la frase anterior."
              : "Configurada · Necesitas otro método de acceso para reemplazarla."
        }
        action={
          <Button
            color={hasSeed ? "inherit" : "warning"}
            disabled={!canRegenerate}
            onClick={() => {
              setError("");
              setConfirmationOpen(true);
            }}
            size="small"
            variant="outlined"
          >
            {hasSeed ? "Regenerar" : "Generar"}
          </Button>
        }
        testId="account-seed-setting"
      />

      <Modal
        fullWidth
        maxWidth="xs"
        open={confirmationOpen}
        onClose={() => {
          if (!isPending) {
            setConfirmationOpen(false);
            setError("");
          }
        }}
        preventCloseOnBackdropClick={isPending}
        title={hasSeed ? "Regenerar frase" : "Generar frase"}
        actions={
          <Stack direction="row" gap={1} justifyContent="flex-end" width="100%">
            <Button color="inherit" disabled={isPending} onClick={() => setConfirmationOpen(false)}>
              Cancelar
            </Button>
            <LoadingButton
              color="warning"
              isLoading={isPending}
              onClick={generateSeed}
              variant="contained"
            >
              {hasSeed ? "Regenerar" : "Generar"}
            </LoadingButton>
          </Stack>
        }
      >
        <Stack gap={1.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Alert severity="warning">
            {hasSeed
              ? "La frase anterior dejará de funcionar. La nueva se mostrará una sola vez."
              : "La frase se mostrará una sola vez. Guardala antes de cerrar."}
          </Alert>
          <Typography color="text.secondary" variant="body2">
            Quien tenga esta frase puede entrar a tu cuenta. No la compartas.
          </Typography>
        </Stack>
      </Modal>

      <Modal
        disableEscapeKeyDown
        fullWidth
        hideClose
        maxWidth="sm"
        open={Boolean(seedPhrase)}
        onClose={() => undefined}
        preventCloseOnBackdropClick
        title="Guarda tu frase"
        actions={
          <Button
            color="success"
            onClick={() => {
              setSeedPhrase("");
              setCopied(false);
              void queryClient.invalidateQueries({ queryKey: ["me"] });
            }}
            variant="contained"
            sx={{ fontWeight: 900 }}
          >
            Ya la guardé
          </Button>
        }
      >
        <Stack gap={1.5}>
          <Alert severity="warning">No volveremos a mostrar esta frase.</Alert>
          <AccountInset sx={{ p: 2, textAlign: "center" }}>
            <Typography
              data-testid="account-seed-phrase"
              fontFamily="monospace"
              fontSize={{ xs: "1.15rem", sm: "1.35rem" }}
              fontWeight={900}
              letterSpacing="0.055em"
              sx={{ overflowWrap: "anywhere" }}
            >
              {seedPhrase}
            </Typography>
          </AccountInset>
          <Button
            color="inherit"
            onClick={() => void copySeed()}
            startIcon={<ContentCopyOutlined />}
            variant="outlined"
          >
            {copied ? "Copiada" : "Copiar frase"}
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
