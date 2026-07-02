import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useMagicLinkLogin = () => {
  const { mutate, error, isPending } = useMutation({
    mutationKey: ["magic-link-login"],
    mutationFn: ({ email, next }: { email: string; next?: "profile" }) =>
      apiClient.instance.post("/auth/magic-link/login", { email, next }),
  });

  return { sendMagicLink: mutate, error, isPending };
};
