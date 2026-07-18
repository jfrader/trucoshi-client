import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";

export const usePayRequest = (
  options: Omit<UseMutationOptions<AxiosResponse, AxiosError, string>, "mutationFn"> = {},
) => {
  const queryClient = useQueryClient();
  const {
    mutate: pay,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["pay-request-pay"],
    mutationFn: (payRequestId: string) => apiClient.wallet.payRequest(payRequestId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["me"] });
    },
    ...options,
  });

  return { pay, error, isPending };
};
