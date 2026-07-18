import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  const { data, mutate, error, isPending, reset } = useMutation({
    mutationKey: ["wallet-withdraw"],
    mutationFn: (data: Parameters<typeof apiClient.wallet.payWithdrawInvoice>[0]) =>
      apiClient.wallet.payWithdrawInvoice(data),
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ["me"] });
    },
  });

  return {
    reset,
    withdrawal: data?.data,
    withdraw: mutate,
    error,
    isPending,
  };
};
