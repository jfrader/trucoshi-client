import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export const TwitterCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      console.error("Twitter callback error:", error);
      window.opener?.postMessage({ type: "TWITTER_AUTH_ERROR", error }, "*");
      window.close();
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["me"] });
    window.close();
    navigate("/");
  }, [location.search, navigate, queryClient]);

  return null;
};

export default TwitterCallback;
