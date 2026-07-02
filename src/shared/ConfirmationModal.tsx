import { Button, Stack } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { Modal, ModalProps } from "./Modal";
import { ReactNode } from "react";

type Props = { isLoading?: boolean; formId?: string };

export type ConfirmationModalProps = ModalProps<ConfirmationModalState> & Props;

export type ConfirmationModalState<T = any> = {
  acceptLabel?: string;
  acceptButtonProps?: Omit<ButtonProps, "children">;
  title?: string;
  body?: ReactNode;
  onConfirm?: (...p: any[]) => any;
  onSecondary?: (...p: any[]) => any;
  secondaryButtonProps?: Omit<ButtonProps, "children">;
  secondaryLabel?: string;
} & T;

export const ConfirmationModal = ({
  formId = "confirmation-modal",
  children,
  isLoading = false,
  ...props
}: ConfirmationModalProps) => {
  const {
    title = "Estas seguro?",
    acceptLabel = "Aceptar",
    acceptButtonProps,
    onConfirm,
    onSecondary,
    secondaryButtonProps,
    secondaryLabel,
    body,
  } = props.state;
  return (
    <Modal
      maxWidth="xs"
      fullWidth
      title={title}
      fullScreen={false}
      {...props}
      actions={
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm ? onConfirm() : props.onClose();
          }}
        >
          <Stack direction="row" gap={2} width="100%">
            <Button
              type="submit"
              color="primary"
              disabled={isLoading}
              form={formId}
              {...acceptButtonProps}
            >
              {acceptLabel}
            </Button>
            {secondaryLabel ? (
              <Button
                type="button"
                variant="text"
                disabled={isLoading}
                onClick={() => {
                  onSecondary?.();
                }}
                {...secondaryButtonProps}
              >
                {secondaryLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="text"
              color="error"
              disabled={isLoading}
              onClick={() => {
                props.onClose();
              }}
            >
              Cancelar
            </Button>
          </Stack>
        </form>
      }
    >
      {body || children}
    </Modal>
  );
};
