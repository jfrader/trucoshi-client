import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess() {
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    mutationKey: ["register"],
    mutationFn: (data: Parameters<typeof apiClient.auth.registerUser>[0]) =>
      apiClient.auth.registerUser(data),
  });

  return { register: mutate, error, isPending };
};
