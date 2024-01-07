import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useCreateDeposit = () => {
  const { data, mutate, error, isPending, reset } = useMutation({
    mutationKey: ["wallet-create-deposit"],
    mutationFn: apiClient.wallet.depositCreate,
  });

  return {
    reset,
    deposit: data?.data,
    createDeposit: mutate,
    error,
    isPending,
  };
};
