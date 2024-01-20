import { OptionsWithExtraProps, VariantType, useSnackbar } from "notistack";
import { useCallback, useMemo } from "react";

type ToastFnOptions<V extends VariantType> = Omit<OptionsWithExtraProps<V>, "variant" | "message">;

export const useToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const toast = useCallback(
    (message: string, options?: ToastFnOptions<"default">) =>
      enqueueSnackbar(message, { variant: "default", ...options }),
    [enqueueSnackbar],
  );

  const success = useCallback(
    (message: string, options?: ToastFnOptions<"success">) =>
      enqueueSnackbar(message, { variant: "success", ...options }),
    [enqueueSnackbar],
  );

  const warning = useCallback(
    (message: string, options?: ToastFnOptions<"warning">) =>
      enqueueSnackbar(message, { variant: "warning", ...options }),
    [enqueueSnackbar],
  );

  const error = useCallback(
    (message: string, options?: ToastFnOptions<"error">) =>
      enqueueSnackbar(message, { variant: "error", ...options }),
    [enqueueSnackbar],
  );

  const info = useCallback(
    (message: string, options?: ToastFnOptions<"info">) =>
      enqueueSnackbar(message, { variant: "info", ...options }),
    [enqueueSnackbar],
  );

  return useMemo(
    () => ({ toast, success, warning, error, info, closeSnackbar }),
    [closeSnackbar, error, info, success, toast, warning],
  );
};
