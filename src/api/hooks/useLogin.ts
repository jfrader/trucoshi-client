import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess(data) {
      queryClient.setQueryData(["me"], data);
      void queryClient.refetchQueries({ queryKey: ["me"] });
    },
    mutationKey: ["login"],
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.auth.loginUser(data),
  });

  return { login: mutate, error, isPending };
};
