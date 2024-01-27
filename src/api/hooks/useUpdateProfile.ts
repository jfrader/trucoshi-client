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
    mutationFn: apiClient.users.usersPartialUpdate.bind(this, String(me?.id)),
  });

  return { updateProfile: mutate, error, isPending };
};
