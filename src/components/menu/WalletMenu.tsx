import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useRef, useState } from "react";
import { Bolt, Check, Close } from "@mui/icons-material";
import { DepositMenu } from "./DepositMenu";
import { Sats } from "../../shared/Sats";
import { useCreateDeposit } from "../../api/hooks/useCreateDeposit";
import { SatoshiIcon } from "../../assets/icons/SatoshiIcon";
import { useWithdraw } from "../../api/hooks/useWithdraw";
import { useToast } from "../../hooks/useToast";

export const WalletMenu = () => {
  const toast = useToast();
  const [{ account }] = useTrucoshi();
  const { createDeposit, deposit, reset: resetDeposit } = useCreateDeposit();
  const { withdraw, withdrawal, reset: resetWithdraw, isPending } = useWithdraw();

  const [isDeposit, setDeposit] = useState<string | null>(null);
  const [isDepositOpen, setDepositOpen] = useState(false);

  const [withdrawInvoice, setWithdrawInvoice] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!account?.wallet) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Stack direction="row" justifyContent="space-between" pb={1}>
        <Typography
          width="100%"
          textAlign="left"
          color="text.disabled"
          textTransform="uppercase"
          variant="subtitle1"
        >
          Balance
        </Typography>
        <Sats amount={account.wallet?.balanceInSats || 0} />
      </Stack>
      <FormGroup>
        <Collapse in={isDeposit === null}>
          <FormGroup>
            <Button
              color="warning"
              size="large"
              onClick={() => {
                setDeposit("");
                setWithdrawInvoice(null);
                setTimeout(() => inputRef.current?.focus());
              }}
            >
              Depositar
            </Button>
          </FormGroup>
        </Collapse>
        <Collapse in={isDeposit !== null} mountOnEnter unmountOnExit>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDeposit(null);
              const amountInSats = Number(inputRef.current?.value);
              if (deposit && !deposit.invoiceSettled && deposit.amountInSats === amountInSats) {
                return setDepositOpen(true);
              }
              setDepositOpen(true);
              createDeposit(
                { amountInSats },
                {
                  onError(e) {
                    toast.error(e.message);
                    setDepositOpen(false);
                  },
                }
              );
              setTimeout(() => inputRef.current?.blur());
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton
                title="Cancelar"
                onClick={() => setDeposit(null)}
                color="warning"
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                variant="outlined"
                label="Depositar"
                name="amountInSats"
                autoComplete="off"
                color="warning"
                placeholder="Sats"
                inputRef={inputRef}
                onChange={(e) => {
                  if (!e.target.value.match(/^[0-9]*\.?[0-9]*$/)) {
                    return e.preventDefault();
                  }
                  setDeposit(e.target.value);
                }}
                value={isDeposit}
                InputProps={{
                  endAdornment: <SatoshiIcon color="warning" />,
                }}
              />
              <IconButton
                color={withdrawal ? "success" : "inherit"}
                title="Aceptar"
                type="submit"
                size="small"
                disabled={!Number(isDeposit)}
              >
                <Check fontSize="small" />
              </IconButton>
            </Stack>
          </form>
        </Collapse>
      </FormGroup>
      <FormGroup>
        <Collapse in={withdrawInvoice === null}>
          <FormGroup>
            <Button
              color="warning"
              size="large"
              onClick={() => {
                setWithdrawInvoice("");
                setDeposit(null);
                setTimeout(() => inputRef.current?.focus());
              }}
            >
              Retirar
            </Button>
          </FormGroup>
        </Collapse>
        <Collapse in={withdrawInvoice !== null} mountOnEnter unmountOnExit>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              withdraw(
                { invoice: withdrawInvoice || "" },
                {
                  onError(e) {
                    toast.error(e.message);
                  },
                  onSuccess() {
                    toast.success("Retiro exitoso!");
                    resetWithdraw();
                    setWithdrawInvoice(null);
                  },
                }
              );
              setTimeout(() => inputRef.current?.blur());
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton
                title="Cancelar"
                onClick={() => setWithdrawInvoice(null)}
                color="warning"
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>
              <TextField
                size="small"
                variant="outlined"
                label="Retirar"
                name="invoice"
                autoComplete="off"
                color="warning"
                placeholder="Lightning Invoice"
                inputRef={inputRef}
                onChange={(e) => setWithdrawInvoice(e.target.value)}
                value={isDeposit}
                InputProps={{
                  endAdornment: <Bolt color="warning" />,
                }}
              />
              <IconButton title="Aceptar" type="submit" size="small" disabled={!withdrawInvoice || isPending}>
                <Check fontSize="small" />
              </IconButton>
            </Stack>
          </form>
        </Collapse>
      </FormGroup>
      {isDepositOpen && (
        <Dialog open onClose={() => setDepositOpen(false)}>
          <DialogTitle>Deposito</DialogTitle>
          <DialogContent>
            <DepositMenu
              transaction={deposit}
              onClose={() => {
                resetDeposit();
                setDepositOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};
