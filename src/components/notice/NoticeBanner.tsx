import {
  CallMade,
  CheckCircleOutline,
  Close,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
} from "@mui/icons-material";
import { AlertProps, Box, Button, Fade, IconButton, Typography } from "@mui/material";

export type NoticeBannerProps = {
  text?: string;
  severity?: AlertProps["severity"];
  buttonText?: string | null;
  buttonHref?: string | null;
  hidden: boolean;
  dismissible?: boolean;
  onClose?: () => void;
};

export const BANNER_HEIGHT = "38px";

const severityIcons = {
  error: ErrorOutline,
  info: InfoOutlined,
  success: CheckCircleOutline,
  warning: WarningAmber,
};

export const NoticeBanner = ({
  text,
  severity,
  onClose,
  hidden,
  buttonText,
  buttonHref,
  dismissible = true,
}: NoticeBannerProps) => {
  const displayText = text?.trim();
  const displayButtonText = buttonText?.trim();
  const displayButtonHref = buttonHref?.trim();
  const hasButton = Boolean(displayButtonText && displayButtonHref);
  const severityKey = severity || "info";
  const SeverityIcon = severityIcons[severityKey] || severityIcons.info;

  if (!displayText) {
    return null;
  }

  return (
    <Fade unmountOnExit in={!hidden}>
      <Box
        sx={(theme) => {
          const palette = theme.palette[severityKey] || theme.palette.info;
          const backgroundColor = palette.dark || palette.main;
          return {
            alignItems: "center",
            backgroundColor,
            color: theme.palette.getContrastText(backgroundColor),
            display: "flex",
            gap: 1,
            minHeight: BANNER_HEIGHT,
            overflow: "hidden",
            px: { xs: 1.5, sm: 2 },
            py: 0.5,
            width: "100%",
          };
        }}
      >
        <SeverityIcon fontSize="small" sx={{ flex: "0 0 auto" }} />
        <Typography
          title={displayText}
          variant="body2"
          sx={{
            flex: "1 1 auto",
            fontWeight: 700,
            lineHeight: 1.25,
            minWidth: 0,
            overflow: "hidden",
            textAlign: "left",
            textOverflow: "ellipsis",
          }}
        >
          {displayText}
        </Typography>
        {hasButton ? (
          <Button
            component="a"
            endIcon={<CallMade fontSize="small" />}
            href={displayButtonHref}
            sx={{
              color: "inherit",
              flex: "0 0 auto",
              fontSize: "0.78rem",
              fontWeight: 800,
              minWidth: 0,
              px: 0.75,
              py: 0,
              textDecoration: "underline",
              whiteSpace: "nowrap",
            }}
            variant="text"
          >
            {displayButtonText}
          </Button>
        ) : null}
        {dismissible ? (
          <IconButton
            aria-label="Cerrar aviso"
            color="inherit"
            onClick={onClose}
            size="small"
            sx={{
              flex: "0 0 auto",
              ml: hasButton ? 0 : "auto",
              p: 0.25,
            }}
          >
            <Close color="inherit" fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
    </Fade>
  );
};
