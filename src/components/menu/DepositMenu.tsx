import { Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import QRCode from "react-qr-code";
import { Sats } from "../../shared/Sats";
import type { Transaction } from "lightning-accounts";
import { useDeposit } from "../../api/hooks/useDeposit";
import { useEffect } from "react";
import { useToast } from "../../hooks/useToast";

export const DepositMenu = ({
  transaction,
  onClose,
}: {
  transaction?: Transaction;
  onClose(): void;
}) => {
  const toast = useToast();
  const { deposit, enable } = useDeposit({ transactionId: String(transaction?.id) });

  useEffect(() => {
    if (transaction) {
      enable();
    }
  }, [enable, transaction]);

  const onCopy = () => {
    navigator.clipboard
      .writeText(invoice)
      .then(() => toast.info("Invoice copiado al portapapeles"))
      .catch(() => toast.error("Error al copiar"));
  };

  const invoice = (deposit?.invoice as any)?.request;

  return (
    <Stack>
      {transaction && deposit?.invoice ? (
        <>
          {deposit.walletImpacted ? (
            <Stack gap={2}>
              <Typography>Deposito recibido!</Typography>
              <Button onClick={() => onClose()}>Jugar!</Button>
            </Stack>
          ) : (
            <Stack gap={2}>
              <QRCode value={invoice} size={"15em" as any as number} />
              <Stack direction="row" width="100%" justifyContent="center">
                <Button color="error" onClick={() => onClose()}>
                  Cancelar
                </Button>
                <Button color="info" onClick={onCopy}>
                  Copiar Invoice
                </Button>
              </Stack>
              <TextField
                onClick={onCopy}
                fullWidth
                InputProps={{ readOnly: true }}
                name="invoice-text"
                value={invoice || ""}
              />
              <Sats variant="h2" amount={deposit.amountInSats} />
            </Stack>
          )}
        </>
      ) : (
        <Stack py={2} direction="row" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Stack>
      )}
    </Stack>
  );
};
