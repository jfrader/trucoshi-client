import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

export const useSetSeed = () => {
  const { mutate, error, isPending } = useMutation({
    mutationFn: () => apiClient.auth.addSeed({ withCredentials: true }).then((res) => res.data),
  });

  return { setSeed: mutate, error, isPending };
};
