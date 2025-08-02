import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useSeedLogin = () => {
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: { seedPhrase: string }) =>
      apiClient.auth.loginWithSeed(data, { withCredentials: true }),
  });

  return { seedLogin: mutate, error, isPending };
};
