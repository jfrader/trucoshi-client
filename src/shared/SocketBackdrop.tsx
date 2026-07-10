import { BackdropProps } from "@mui/material";
import { PropsWithChildren } from "react";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { Backdrop } from "./Backdrop";

export const SocketBackdrop = ({
  message,
  ...props
}: PropsWithChildren<Omit<BackdropProps, "open"> & { message?: string }>) => {
  const [{ isConnected, isLoggingIn }] = useTrucoshi();
  return (
    <Backdrop
      {...props}
      appear={false}
      open={!isConnected || isLoggingIn}
      message={message || "Conectando..."}
      loading={true}
    />
  );
};
