import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess() {
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    mutationKey: ["register"],
    mutationFn: apiClient.auth.registerCreate,
  });

  return { register: mutate, error, isPending };
};
