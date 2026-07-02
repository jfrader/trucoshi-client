import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { User } from "lightning-accounts";
import { apiClient } from "../apiClient";

export const useConsumeMagicLink = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["magic-link-consume"],
    mutationFn: ({ token }: { token: string }) =>
      apiClient.instance.post<{ user?: User }>("/auth/magic-link/consume", null, {
        params: { token },
      }),
    onSuccess(data: AxiosResponse<{ user?: User }>) {
      if (data.data.user) {
        queryClient.setQueryData(["me"], { data: data.data.user });
      }
      queryClient.resetQueries({ queryKey: ["me"] });
    },
  });

  return { consumeMagicLink: mutate, error, isPending };
};
