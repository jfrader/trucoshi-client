import {
  Button,
  CircularProgress,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import {
  ErrorBoundary as SentryErrorBoundary,
  type ErrorBoundaryProps,
  type FallbackRender,
} from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { type PropsWithChildren, useRef, useState } from "react";
import { useVersionReload } from "./hooks/useVersionReload";
import { ConfirmationModal } from "./shared/ConfirmationModal";
import CustomSnackbar from "./shared/CustomSnackbar";
import { SoundProvider } from "./sound/sound.context";
import { themes } from "./theme";
import { useTrucoshi } from "./trucoshi/hooks/useTrucoshi";
import { TrucoshiProvider } from "./trucoshi/trucoshi.context";

const SnackbarComponents = {
  default: CustomSnackbar,
  success: CustomSnackbar,
  error: CustomSnackbar,
  info: CustomSnackbar,
  warning: CustomSnackbar,
};

const DYNAMIC_IMPORT_ERROR_MESSAGES = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Loading chunk .+ failed/i,
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "";
};

const isDynamicImportError = (error: unknown) => {
  const message = getErrorMessage(error);
  return DYNAMIC_IMPORT_ERROR_MESSAGES.some((pattern) => pattern.test(message));
};

const AppDynamicImportFallback = () => (
  <Stack
    role="status"
    aria-label="Recargando"
    minHeight="100vh"
    alignItems="center"
    justifyContent="center"
    spacing={2}
    px={3}
  >
    <CircularProgress color="inherit" />
    <Typography color="text.secondary" textAlign="center">
      Recargando Trucoshi...
    </Typography>
  </Stack>
);

const AppErrorFallback = ({ onReload }: { onReload: () => void }) => (
  <Stack minHeight="100vh" alignItems="center" justifyContent="center" spacing={2} px={3}>
    <Typography variant="h6" textAlign="center">
      No pudimos cargar Trucoshi
    </Typography>
    <Typography color="text.secondary" textAlign="center">
      Reintentá recargando la aplicación.
    </Typography>
    <Button variant="contained" color="primary" onClick={onReload}>
      Recargar
    </Button>
  </Stack>
);

const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const [{ dark }] = useTrucoshi();

  return (
    <ThemeProvider
      theme={dark === "true" ? themes.trucoshi : dark === "false" ? themes.light : themes.dark}
    >
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const AppErrorBoundaryProvider = ({ children }: PropsWithChildren) => {
  const hasReloadTriggeredRef = useRef(false);
  const hasVersionRefetchTriggeredRef = useRef(false);

  const { modal, onReload, refetch } = useVersionReload({
    currentVersion: import.meta.env.VITE_APP_VERSION,
  });

  const handleAppError: NonNullable<ErrorBoundaryProps["onError"]> = (error) => {
    if (isDynamicImportError(error)) {
      if (!hasReloadTriggeredRef.current) {
        hasReloadTriggeredRef.current = true;
        onReload();
      }
      return;
    }

    if (!hasVersionRefetchTriggeredRef.current) {
      hasVersionRefetchTriggeredRef.current = true;
      void refetch();
    }
  };

  const setAppErrorContext: NonNullable<ErrorBoundaryProps["beforeCapture"]> = (scope, error) => {
    scope.setTag("boundary", "app-provider");

    if (isDynamicImportError(error)) {
      scope.setTag("dynamic_import_error", "true");
    }
  };

  const renderAppErrorFallback: FallbackRender = ({ error }) => {
    if (isDynamicImportError(error)) {
      return <AppDynamicImportFallback />;
    }

    return <AppErrorFallback onReload={onReload} />;
  };

  return (
    <TrucoshiProvider>
      <AppThemeProvider>
        <SentryErrorBoundary
          beforeCapture={setAppErrorContext}
          fallback={renderAppErrorFallback}
          onError={handleAppError}
        >
          <SoundProvider>{children}</SoundProvider>
        </SentryErrorBoundary>

        <ConfirmationModal preventCloseOnBackdropClick {...modal} />
      </AppThemeProvider>
    </TrucoshiProvider>
  );
};

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider
        autoHideDuration={4800}
        Components={SnackbarComponents}
        style={{ maxWidth: "100%" }}
      >
        <AppErrorBoundaryProvider>{children}</AppErrorBoundaryProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
};
