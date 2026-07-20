import { Close } from "@mui/icons-material";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { UseModalProps } from "../hooks/useModal";

type Props = {
  title?: ReactNode;
  actions?: ReactNode;
  hideClose?: boolean;
  preventCloseOnBackdropClick?: boolean;
  isLoading?: boolean;
};

export type ModalProps<T = Record<string, any>> = Partial<
  Pick<UseModalProps<T>, "onOpen" | "onToggle" | "setState" | "state">
> &
  Pick<UseModalProps<T>, "open" | "onClose"> &
  PropsWithChildren<Omit<DialogProps, "children" | "title">> &
  Props;

export const Modal = <T extends Record<string, any>>({
  children,
  title,
  actions = null,
  hideClose = false,
  preventCloseOnBackdropClick = false,
  isLoading = false,
  open,
  onClose,
  ...props
}: ModalProps<T>) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onOpen, onToggle, setState, state, ...rest } = props;

  return (
    <Dialog
      scroll="paper"
      fullScreen={isSm}
      open={open}
      {...rest}
      onClose={(_e, reason) => {
        if (reason && preventCloseOnBackdropClick && reason === "backdropClick") {
          return;
        }
        onClose();
      }}
    >
      {title && <DialogTitle>{title}</DialogTitle>}

      {children ? (
        <DialogContent sx={{ backgroundColor: "inherit" }}>
          {isLoading ? (
            <Stack py={8} height="100%" alignItems="center" justifyContent="center">
              <CircularProgress />
            </Stack>
          ) : (
            <>
              {hideClose ? null : (
                <IconButton
                  onClick={() => onClose()}
                  disableRipple
                  size="small"
                  sx={{ position: "absolute", top: 4, right: 4 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
              <Stack height="100%" pt={2}>
                {children}
              </Stack>
            </>
          )}
        </DialogContent>
      ) : null}
      {actions ? (
        <DialogActions sx={{ backgroundColor: "inherit" }}>
          {isLoading ? null : actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
};
