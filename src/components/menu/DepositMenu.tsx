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
  transaction?: Transaction;
  onClose(): void;
}) => {
  const { deposit, enable } = useDeposit({ transactionId: String(transaction?.id) });

  useEffect(() => {
    if (transaction) {
      enable();
    }
  }, [enable, transaction]);

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
              <QRCode value={(deposit.invoice as any)?.request} size={"15em" as any as number} />
              <Stack direction="row" width="100%" justifyContent="center">
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
