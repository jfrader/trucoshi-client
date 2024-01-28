import { Box, Button, ButtonProps, CircularProgress, styled } from "@mui/material";

export type LoadingButtonProps = {
  label?: string;
  isLoading?: boolean;
} & ButtonProps;

const StyledButton = styled(Button)({
  whiteSpace: "nowrap",
  position: "relative",
});

export const LoadingButton = ({
  children,
  label = "Submit",
  disabled,
  isLoading,
  ...props
}: LoadingButtonProps) => {
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
