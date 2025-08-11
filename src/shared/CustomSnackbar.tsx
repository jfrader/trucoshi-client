import React, { useEffect, useState } from "react";
import { Snackbar, LinearProgress, Box, Alert } from "@mui/material";
import { CustomContentProps, SnackbarContent, useSnackbar } from "notistack";

const CustomSnackbar = React.forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { id, message, variant, autoHideDuration, action, anchorOrigin } = props;

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
      <Snackbar
        open
        autoHideDuration={autoHideDuration}
        anchorOrigin={anchorOrigin}
        onClose={() => closeSnackbar(id)}
      >
        <Box position="relative">
          <Alert
            action={
              <div
                onClick={() => {
                  closeSnackbar(id);
                }}
              >
                {typeof action === "function" ? action(id) : action}
              </div>
            }
            sx={{ whiteSpace: "nowrap", pb: 2 }}
            onClose={() => closeSnackbar(id)}
            severity={variant === "default" ? undefined : variant}
          >
            {message}
          </Alert>
          {action ? (
            <LinearProgress
              sx={{
                position: "relative",
                bottom: "4px",
                borderBottomLeftRadius: "0.5em",
                borderBottomRightRadius: "0.5em",
              }}
              variant="determinate"
              value={progress}
            />
          ) : null}
        </Box>
      </Snackbar>
    </SnackbarContent>
  );
});

CustomSnackbar.displayName = "CustomSnackbar";

export default CustomSnackbar;
