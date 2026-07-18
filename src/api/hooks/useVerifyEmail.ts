import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useVerifyEmail = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["verifyEmail"],
    mutationFn: ({ token }: { token: string }) => apiClient.auth.verifyEmail({ token }),
  });

  return { verifyEmail: mutate, error, isPending };
};