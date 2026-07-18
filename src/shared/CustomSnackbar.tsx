import React, { useEffect, useState } from "react";
import { LinearProgress, Box, Alert, AlertTitle } from "@mui/material";
import { CustomContentProps, SnackbarContent, useSnackbar } from "notistack";

const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { id, message, variant, autoHideDuration, action, iconVariant } = props;

  const [progress, setProgress] = useState(0);
  const { closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!autoHideDuration) {
      return;
    }
    const interval = 16;
    const step = (interval / (autoHideDuration - 500)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoHideDuration]);

  return (
    <SnackbarContent ref={ref}>
      <Box position="relative">
        <Alert
          iconMapping={iconVariant}
          action={
            action ? (
              <div
                onClick={() => {
                  closeSnackbar(id);
                }}
              >
                {typeof action === "function" ? action(id) : action}
              </div>
            ) : null
          }
          sx={{ whiteSpace: "nowrap", pb: autoHideDuration ? 1 : 0 }}
          severity={variant === "default" ? undefined : variant}
        >
          <AlertTitle>{message}</AlertTitle>
        </Alert>
        {autoHideDuration ? (
          <LinearProgress
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              borderBottomLeftRadius: "0.5em",
              borderBottomRightRadius: "0.5em",
            }}
            color={variant === "default" ? undefined : variant}
            variant="determinate"
            value={progress}
          />
        ) : null}
      </Box>
    </SnackbarContent>
  );
});

CustomSnackbar.displayName = "CustomSnackbar";

export default CustomSnackbar;
