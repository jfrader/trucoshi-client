import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { useExternalPopup } from "./useExternalPopup";
import { useState, useEffect } from "react";

export const useTwitterPopup = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPopupClosed = () => {
    setIsLoading(false);
    queryClient.resetQueries({ queryKey: ["me"] });
  };

  const { open, error: popupError } = useExternalPopup(onPopupClosed);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "TWITTER_AUTH_ERROR") {
        setError(event.data.error || "X authentication failed");
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return {
    open: () => {
      setIsLoading(true);
      setError(null);
      open({
        url: apiClient.instance.defaults.baseURL + "/auth/twitter",
        title: "Login with X",
      });
    },
    isLoading,
    error: error || popupError,
  };
};
