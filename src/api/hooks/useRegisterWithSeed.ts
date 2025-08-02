import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useRegisterWithSeed = () => {
  const { mutate, error, isPending } = useMutation({
    mutationFn: (data: { name: string; seedPhrase: string }) =>
      apiClient.auth.registerWithSeed(data, { withCredentials: true }).then((res) => res.data),
  });

  return { registerWithSeed: mutate, error, isPending };
};
