import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useMagicLinkRegister = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["magic-link-register"],
    mutationFn: ({ name, email }: { name: string; email: string }) =>
      apiClient.instance.post("/auth/magic-link/register", { name, email }),
  });

  return { registerWithMagicLink: mutate, error, isPending };
};
