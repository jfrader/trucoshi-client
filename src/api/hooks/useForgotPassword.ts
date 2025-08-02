import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useForgotPassword = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["forgotPassword"],
    mutationFn: ({ email }: { email: string }) => apiClient.auth.requestPasswordReset({ email }),
  });

  return { requestPasswordReset: mutate, error, isPending };
};
