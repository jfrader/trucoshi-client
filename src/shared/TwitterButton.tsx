import { X } from "@mui/icons-material";
import { LoadingButton, LoadingButtonProps } from "./LoadingButton";
import { useTwitterPopup } from "../hooks/useTwitterPopup";

export const TwitterButton = ({ children, ...props }: LoadingButtonProps) => {
  const { open } = useTwitterPopup();
  return (
    <LoadingButton
      startIcon={<X />}
      onClick={open}
      color="twitter"
      variant="outlined"
      {...props}
    >
      {children || "Login con X"}
    </LoadingButton>
  );
};
