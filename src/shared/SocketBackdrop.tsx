import { BackdropProps, Button } from "@mui/material";
import { PropsWithChildren } from "react";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { Backdrop } from "./Backdrop";

export const SocketBackdrop = ({
  message,
  children,
  ...props
}: PropsWithChildren<Omit<BackdropProps, "open"> & { message?: string }>) => {
  const [{ isConnected, isLoggingIn, accountError }, { refetchMe }] = useTrucoshi();
  return (
    <Backdrop
      {...props}
      mountOnEnter
      unmountOnExit
      open={Boolean(accountError) || !isConnected || isLoggingIn}
      message={accountError ? "No se pudo cargar tu cuenta." : message || "Conectando..."}
      loading={!accountError}
      role={accountError ? "alert" : undefined}
      aria-hidden={accountError ? false : undefined}
    >
      {accountError ? (
        <Button
          autoFocus
          color="warning"
          variant="contained"
          sx={{ minHeight: (theme) => theme.spacing(6) }}
          onClick={() => void refetchMe()}
        >
          Reintentar
        </Button>
      ) : children}
    </Backdrop>
  );
};
