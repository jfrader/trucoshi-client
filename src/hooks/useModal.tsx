import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

export type UseModalProps<TState = Record<string, any>> = {
  open: boolean;
  onOpen(args?: any): any;
  onClose(args?: any): any;
  onToggle(args?: any): any;
  state: TState;
  setState: Dispatch<SetStateAction<TState>>;
};

export type UseModalOptions<TState extends Record<string, any>> = Omit<
  Partial<UseModalProps<TState>>,
  "setState"
>;

export const useModal = <TState extends Record<string, any> = Record<string, any>>(
  options: UseModalOptions<TState> = {}
) => {
  const [open, setOpen] = useState(options.open || false);
  const [state, setState] = useState<TState>(options.state || ({} as TState));

  const onOpen = useCallback(
    (state?: SetStateAction<TState>) => {
      options.onOpen?.();
      setOpen(true);
      if (state) {
        setState(state);
      }
    },
    [options]
  );

  const onToggle = useCallback(
    (state?: SetStateAction<TState>) => {
      options.onToggle?.();
      setOpen((current) => !current);
      if (state) {
        setState(state);
      }
    },
    [options]
  );

  const onClose = useCallback(() => {
    options.onClose?.();
    setOpen(false);
  }, [options]);

  return useMemo(
    () =>
      ({
        open,
        onOpen,
        onClose,
        onToggle,
        setState,
        state,
      } satisfies UseModalProps<TState>),
    [onClose, onOpen, onToggle, open, state]
  );
};
