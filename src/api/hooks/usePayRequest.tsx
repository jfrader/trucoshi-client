import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError } from "axios";
import { ApiResponse } from "../types";

export const usePayRequest = (
  options: Omit<UseMutationOptions<ApiResponse, AxiosError, string>, "mutationFn"> = {},
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
      void queryClient.refetchQueries({ queryKey: ["me"] });
    },
    ...options,
  });

  return { pay, error, isPending };
};
