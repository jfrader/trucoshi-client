import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError } from "axios";
import { ApiResponse } from "../types";

export const useRefreshTokens = (
  options: Omit<UseMutationOptions<ApiResponse, AxiosError, unknown>, "mutationFn"> = {},
) => {
  const queryClient = useQueryClient();
  const {
    mutate: refreshTokens,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["refresh-tokens"],
    mutationFn: apiClient.auth.refreshAuthTokens,
    onSuccess(...params) {
      options.onSuccess?.(...params);
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    ...options,
  });

  return { refreshTokens, error, isPending };
};
