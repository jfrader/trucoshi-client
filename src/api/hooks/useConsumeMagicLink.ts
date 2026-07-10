import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "lightning-accounts";
import { apiClient } from "../apiClient";
import { ApiResponse } from "../types";

export const useConsumeMagicLink = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["magic-link-consume"],
    mutationFn: ({ token }: { token: string }) =>
      apiClient.instance.post<{ user?: User }>("/auth/magic-link/consume", null, {
        params: { token },
      }),
    onSuccess(data: ApiResponse<{ user?: User }>) {
      if (data.data.user) {
        queryClient.setQueryData(["me"], { data: data.data.user });
      }
      queryClient.resetQueries({ queryKey: ["me"] });
    },
  });

  return { consumeMagicLink: mutate, error, isPending };
};
