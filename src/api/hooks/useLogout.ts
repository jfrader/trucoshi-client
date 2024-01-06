import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess() {
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    mutationKey: ["logout"],
    mutationFn: apiClient.auth.logoutCreate,
  });

  return {
    logout: mutate,
    error,
    isPending,
  };
};
