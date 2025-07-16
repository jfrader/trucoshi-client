import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TwitterFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error") || "Authentication failed";
    console.error("Twitter authentication failed:", error);

    window.opener?.postMessage({ type: "TWITTER_AUTH_ERROR", error }, window.location.origin);

    if (window.opener) {
      window.close();
    } else {
      navigate("/login", { state: { error } });
    }
  }, [location.search, navigate]);

  return null;
};

export default TwitterFailure;
