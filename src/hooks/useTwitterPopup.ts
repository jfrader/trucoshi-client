import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { useExternalPopup } from "./useExternalPopup";

export const useTwitterPopup = () => {
  const queryClient = useQueryClient();

  const { open } = useExternalPopup(
    () => queryClient.resetQueries({ queryKey: ["me"] }), // when closed
    () => queryClient.resetQueries({ queryKey: ["me"] }) // when message received
  );

  return {
    open: () =>
      open({
        url: apiClient.instance.defaults.baseURL + "/auth/twitter",
        title: "Login con Twitter",
      }),
  };
};
