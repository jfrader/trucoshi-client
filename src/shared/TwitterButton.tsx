import { X } from "@mui/icons-material";
import { LoadingButton, LoadingButtonProps } from "./LoadingButton";
import { apiClient } from "../api/apiClient";
import { Link } from "react-router-dom";

export const TwitterButton = ({ children, ...props }: LoadingButtonProps) => {
  return (
    <LoadingButton
      startIcon={<X />}
      component={Link}
      to={apiClient.instance.defaults.baseURL + "/auth/twitter"}
      color="twitter"
      variant="outlined"
      {...props}
    >
      {children || "Login con X"}
    </LoadingButton>
  );
};
