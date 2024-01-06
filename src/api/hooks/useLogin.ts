import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess() {
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    mutationKey: ["login"],
    mutationFn: apiClient.auth.loginCreate,
  });

  return { login: mutate, error, isPending };
};
