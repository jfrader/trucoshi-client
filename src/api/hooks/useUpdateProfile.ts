import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { useMe } from "./useMe";

export const useUpdateProfile = () => {
  const { me } = useMe();
  const queryClient = useQueryClient();
  const { mutate, error, isPending } = useMutation({
    onSuccess() {
      queryClient.resetQueries({ queryKey: ["me"] });
    },
    mutationKey: ["me-update-profile"],
    mutationFn: (data: {
      name?: string;
      email?: string;
      currentPassword?: string;
      password?: string;
    }) => apiClient.users.updateUser(String(me?.id), data),
  });

  return { updateProfile: mutate, error, isPending };
};
