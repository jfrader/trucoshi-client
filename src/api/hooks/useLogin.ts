import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess(data) {
      queryClient.setQueryData(["me"], data);
      queryClient.refetchQueries({ queryKey: ["me"] });
    },
    mutationKey: ["login"],
    mutationFn: (data: Parameters<typeof apiClient.auth.loginUser>[0]) =>
      apiClient.auth.loginUser(data),
  });

  return { login: mutate, error, isPending };
};
