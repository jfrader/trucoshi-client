import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useCreateDeposit = () => {
  const { data, mutate, error, isPending, reset } = useMutation({
    mutationKey: ["wallet-create-deposit"],
    mutationFn: (data: { amountInSats: number }) =>
      apiClient.wallet.createDepositInvoice(data),
  });

  return {
    reset,
    deposit: data?.data,
    createDeposit: mutate,
    error,
    isPending,
  };
};
