import {
  AccountBalanceWalletOutlined,
  AddRounded,
  ArrowOutwardRounded,
  Bolt,
  CheckRounded,
  CloseRounded,
  CurrencyBitcoin,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { User } from "lightning-accounts";
import { useRef, useState } from "react";
import { useCreateDeposit } from "../../api/hooks/useCreateDeposit";
import { useWithdraw } from "../../api/hooks/useWithdraw";
import { useToast } from "../../hooks/useToast";
import { Sats } from "../../shared/Sats";
import { contentGutterSx } from "../layout/contentLayout";
import { DepositMenu } from "../menu/DepositMenu";
import { AccountIconFrame, AccountInset, AccountPanel, AccountPanelHeader } from "./accountUi";

type Wallet = NonNullable<User["wallet"]>;
type WalletMode = "idle" | "deposit" | "withdraw";

const depositsEnabled = import.meta.env.VITE_ENABLE_BETS_AND_DEPOSITS === "1";

export const AccountWalletSection = ({ wallet }: { wallet: Wallet }) => {
  const toast = useToast();
  const {
    createDeposit,
    deposit,
    reset: resetDeposit,
    isPending: depositPending,
  } = useCreateDeposit();
  const { withdraw, reset: resetWithdraw, isPending: withdrawPending } = useWithdraw();
  const [mode, setMode] = useState<WalletMode>("idle");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawInvoice, setWithdrawInvoice] = useState("");
  const [isDepositOpen, setDepositOpen] = useState(false);
  const depositInputRef = useRef<HTMLInputElement>(null);
  const withdrawInputRef = useRef<HTMLInputElement>(null);

  const openMode = (nextMode: Exclude<WalletMode, "idle">) => {
    setMode(nextMode);
    setTimeout(() => {
      if (nextMode === "deposit") {
        depositInputRef.current?.focus();
      } else {
        withdrawInputRef.current?.focus();
      }
    });
  };

  const closeForm = () => {
    setMode("idle");
    setDepositAmount("");
    setWithdrawInvoice("");
  };

  const submitDeposit = () => {
    const amountInSats = Number(depositAmount);
    if (!Number.isSafeInteger(amountInSats) || amountInSats <= 0) {
      return;
    }

    if (deposit && !deposit.invoiceSettled && deposit.amountInSats === amountInSats) {
      setDepositOpen(true);
      closeForm();
      return;
    }

    setDepositOpen(true);
    createDeposit(
      { amountInSats },
      {
        onError(error) {
          toast.error(error.message);
          setDepositOpen(false);
        },
      },
    );
    closeForm();
  };

  const submitWithdrawal = () => {
    const invoice = withdrawInvoice.trim();
    if (!invoice) {
      return;
    }

    withdraw(
      { invoice },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess() {
          toast.success("Retiro exitoso!");
          resetWithdraw();
          closeForm();
        },
      },
    );
  };

  return (
    <AccountPanel data-testid="account-wallet-section">
      <AccountPanelHeader title="Balance" />
      <Stack
        gap={1.5}
        sx={(theme) => ({
          px: contentGutterSx,
          pb: contentGutterSx,
          borderTop: `1px solid ${theme.trucoshiUi.account.divider}`,
          pt: contentGutterSx,
        })}
      >
        <AccountInset
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 1.5,
            py: 1.35,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.1}>
            <AccountIconFrame>
              <AccountBalanceWalletOutlined />
            </AccountIconFrame>
            <Box>
              <Typography
                color="text.secondary"
                fontSize="0.68rem"
                fontWeight={850}
                letterSpacing="0.075em"
                textTransform="uppercase"
              >
                Disponible
              </Typography>
              <Sats
                amount={wallet.balanceInSats}
                color="warning.light"
                fontSize="1.45rem"
                fontWeight={950}
              />
            </Box>
          </Stack>
          <Typography color="text.secondary" fontSize="0.72rem" textAlign="right">
            Sats
          </Typography>
        </AccountInset>

        {mode === "idle" ? (
          <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
            {depositsEnabled ? (
              <Button
                fullWidth
                color="warning"
                startIcon={<AddRounded />}
                variant="contained"
                onClick={() => openMode("deposit")}
              >
                Depositar sats
              </Button>
            ) : null}
            {wallet.balanceInSats > 0 ? (
              <Button
                fullWidth
                color="warning"
                startIcon={<ArrowOutwardRounded />}
                variant="outlined"
                onClick={() => openMode("withdraw")}
              >
                Retirar balance
              </Button>
            ) : null}
          </Stack>
        ) : null}

        {mode === "deposit" ? (
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              submitDeposit();
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton aria-label="Cancelar depósito" color="warning" onClick={closeForm}>
                <CloseRounded />
              </IconButton>
              <TextField
                autoComplete="off"
                color="warning"
                fullWidth
                inputRef={depositInputRef}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                InputProps={{ endAdornment: <CurrencyBitcoin color="warning" /> }}
                label="Monto a depositar"
                name="amountInSats"
                placeholder="Sats"
                size="small"
                value={depositAmount}
                onChange={(event) => {
                  if (/^\d*$/.test(event.target.value)) {
                    setDepositAmount(event.target.value);
                  }
                }}
              />
              <IconButton
                aria-label="Crear invoice de depósito"
                color="success"
                disabled={!Number(depositAmount) || depositPending}
                type="submit"
              >
                {depositPending ? (
                  <CircularProgress color="inherit" size="1.2rem" />
                ) : (
                  <CheckRounded />
                )}
              </IconButton>
            </Stack>
          </Box>
        ) : null}

        {mode === "withdraw" ? (
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              submitWithdrawal();
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton aria-label="Cancelar retiro" color="warning" onClick={closeForm}>
                <CloseRounded />
              </IconButton>
              <TextField
                autoComplete="off"
                color="warning"
                fullWidth
                inputRef={withdrawInputRef}
                InputProps={{ endAdornment: <Bolt color="warning" /> }}
                label="Invoice Lightning"
                name="invoice"
                placeholder="lnbc…"
                size="small"
                value={withdrawInvoice}
                onChange={(event) => setWithdrawInvoice(event.target.value)}
              />
              <IconButton
                aria-label="Confirmar retiro"
                color="success"
                disabled={!withdrawInvoice.trim() || withdrawPending}
                type="submit"
              >
                {withdrawPending ? (
                  <CircularProgress color="inherit" size="1.2rem" />
                ) : (
                  <CheckRounded />
                )}
              </IconButton>
            </Stack>
          </Box>
        ) : null}
      </Stack>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={isDepositOpen}
        onClose={() => {
          resetDeposit();
          setDepositOpen(false);
        }}
      >
        <DialogTitle>Depósito Lightning</DialogTitle>
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
    </AccountPanel>
  );
};
