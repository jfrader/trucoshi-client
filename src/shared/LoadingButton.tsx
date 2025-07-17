import { Box, Button, ButtonProps, CircularProgress, styled } from "@mui/material";
import { ElementType } from "react";

export type LoadingButtonProps<C extends ElementType = "button"> = {
  label?: string;
  isLoading?: boolean;
  component?: C;
} & ButtonProps<C>; // Use ButtonProps with generic component type

const StyledButton = styled(Button)({
  whiteSpace: "nowrap",
  position: "relative",
});

export const LoadingButton = <C extends ElementType>({
  children,
  label = "Submit",
  disabled,
  isLoading,
  ...props
}: LoadingButtonProps<C>) => {
  return (
    <StyledButton disabled={isLoading || disabled} {...props}>
      <Box visibility={isLoading ? "hidden" : "visible"}>{children || label}</Box>
      <CircularProgress
        size={18}
        sx={{
          display: isLoading ? "block" : "none",
          position: "absolute",
          top: "50%",
          left: "50%",
          marginTop: "-12px",
          marginLeft: "-12px",
        }}
      />
    </StyledButton>
  );
};
