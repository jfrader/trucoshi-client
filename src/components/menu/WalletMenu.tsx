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
import { Close } from "@mui/icons-material";
import { DepositMenu } from "./DepositMenu";
import { Sats } from "../../shared/Sats";
import { useCreateDeposit } from "../../api/hooks/useCreateDeposit";

export const WalletMenu = () => {
  const [{ account }] = useTrucoshi();
  const { createDeposit, deposit, reset } = useCreateDeposit();

  const [isDeposit, setDeposit] = useState<string | null>(null);
  const [isDepositOpen, setDepositOpen] = useState(false);

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
              color="success"
              size="large"
              onClick={() => {
                setDeposit("");
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
              createDeposit(
                { amountInSats },
                {
                  onSuccess() {
                    setDepositOpen(true);
                  },
                }
              );
              setTimeout(() => inputRef.current?.blur());
            }}
          >
            <TextField
              size="small"
              variant="outlined"
              label="Depositar"
              name="amountInSats"
              autoComplete="off"
              color="success"
              placeholder="Sats"
              inputRef={inputRef}
              onChange={(e) => {
                if (!e.target.value.match(/^[0-9]*\.?[0-9]*$/)) {
                  return e.preventDefault();
                }
                setDeposit(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setDeposit(null)} color="error" size="small">
                    <Close fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </form>
        </Collapse>
      </FormGroup>
      {isDepositOpen && deposit && (
        <Dialog open onClose={() => setDepositOpen(false)}>
          <DialogTitle>Deposito</DialogTitle>
          <DialogContent>
            <DepositMenu
              transaction={deposit}
              onClose={() => {
                reset()
                setDepositOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};
