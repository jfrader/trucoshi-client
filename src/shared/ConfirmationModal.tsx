import { Button, Stack } from "@mui/material";
import { Modal, ModalProps } from "./Modal";
import { ReactNode } from "react";

type Props = { isLoading?: boolean; formId?: string };

export type ConfirmationModalProps = ModalProps<ConfirmationModalState> & Props;

export type ConfirmationModalState<T = any> = {
  acceptLabel?: string;
  title?: string;
  body?: ReactNode;
  onConfirm?: (...p: any[]) => any;
} & T;

export const ConfirmationModal = ({
  formId = "confirmation-modal",
  children,
  isLoading = false,
  ...props
}: ConfirmationModalProps) => {
  const { title = "Estas seguro?", acceptLabel = "Aceptar", onConfirm, body } = props.state;
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
            if (onConfirm) {
              onConfirm();
            } else {
              props.onClose();
            }
          }}
        >
          <Stack direction="row" gap={2} width="100%">
            <Button type="submit" color="primary" disabled={isLoading} form={formId}>
              {acceptLabel}
            </Button>
            <Button
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
