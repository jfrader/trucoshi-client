import { ConfirmationModalState } from "../shared/ConfirmationModal";
import { useModal, UseModalOptions, UseModalProps } from "./useModal";

export type UseConfirmationModalProps<
  TState extends ConfirmationModalState & Record<string, any> = Record<string, any>
> = UseModalProps<ConfirmationModalState<TState>>;

export const useConfirmationModal = <TState extends Record<string, any> = Record<string, any>>(
  options?: UseModalOptions<ConfirmationModalState<TState>>
) => useModal<ConfirmationModalState<TState>>(options);
