import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess(data) {
      queryClient.setQueryData(["me"], data);
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.resetQueries({ queryKey: ["me"] })
    },
    mutationKey: ["login"],
    mutationFn: apiClient.auth.loginUser,
  });

  return { login: mutate, error, isPending };
};
