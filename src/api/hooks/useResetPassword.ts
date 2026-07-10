import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { useNavigate } from "@tanstack/react-router";

export const useResetPassword = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      apiClient.auth.resetPassword({ token }, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      void navigate({ to: "/login" });
    },
  });

  return { resetPassword: mutate, error, isPending };
};
