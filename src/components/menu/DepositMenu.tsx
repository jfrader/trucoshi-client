import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import QRCode from "react-qr-code";
import { Sats } from "../../shared/Sats";
import { Transaction } from "lightning-accounts";
import { useDeposit } from "../../api/hooks/useDeposit";
import { useEffect } from "react";

export const DepositMenu = ({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose(): void;
}) => {
  const { deposit, enable } = useDeposit({ transactionId: String(transaction.id) });

  useEffect(() => {
    enable();
  }, [enable]);

  return (
    <Stack>
      {deposit?.invoice ? (
        <>
          {deposit.walletImpacted ? (
            <Stack gap={2}>
              <Typography>Deposito recibido!</Typography>
              <Button onClick={() => onClose()}>Jugar!</Button>
            </Stack>
          ) : (
            <Stack gap={2}>
              <QRCode value={(deposit.invoice as any)?.request} size={225} />
              <Stack direction="row">
                <Button color="error" onClick={() => onClose()}>
                  Cancelar
                </Button>
                <Button
                  color="info"
                  onClick={() => navigator.clipboard.writeText((deposit.invoice as any).request)}
                >
                  Copiar Invoice
                </Button>
              </Stack>
              <Sats amount={deposit.amountInSats} />
            </Stack>
          )}
        </>
      ) : (
        <CircularProgress />
      )}
    </Stack>
  );
};
