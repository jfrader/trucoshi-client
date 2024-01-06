import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";

export const useRefreshTokens = (
  options: Omit<UseMutationOptions<AxiosResponse, AxiosError, unknown>, "mutationFn"> = {}
) => {
  const queryClient = useQueryClient();
  const {
    mutate: refreshTokens,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["refresh-tokens"],
    mutationFn: apiClient.auth.refreshTokensCreate,
    onSuccess(...params) {
      options.onSuccess?.(...params);
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    ...options,
  });

  return { refreshTokens, error, isPending };
};
