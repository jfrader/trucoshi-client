import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";

export const usePayRequest = (
  options: Omit<UseMutationOptions<AxiosResponse, AxiosError, unknown>, "mutationFn"> = {}
) => {
  const {
    mutate: pay,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["pay-request-pay"],
    mutationFn: apiClient.wallet.payRequest,
    ...options,
  });

  return { pay, error, isPending };
};
