import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ErrorInfo, ReactElement, ReactNode } from "react";
import { AppProvider } from "./AppProvider";

const mocks = vi.hoisted(() => ({
  onReload: vi.fn(),
  refetchVersion: vi.fn(),
  sentrySetTag: vi.fn(),
  versionModal: {},
}));

vi.mock("@sentry/react", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  type FallbackRender = (errorData: {
    error: unknown;
    componentStack: string;
    eventId: string;
    resetError(): void;
  }) => ReactElement;

  type TestErrorBoundaryProps = {
    beforeCapture?: (
      scope: { setTag: (key: string, value: string) => void },
      error: unknown,
      componentStack: string
    ) => void;
    children?: ReactNode;
    fallback?: ReactElement | FallbackRender;
    onError?: (error: unknown, componentStack: string, eventId: string) => void;
  };

  type TestErrorBoundaryState = {
    componentStack: string;
    error: unknown;
    eventId: string;
  } | null;

  class ErrorBoundary extends React.Component<TestErrorBoundaryProps, TestErrorBoundaryState> {
    state: TestErrorBoundaryState = null;

    static getDerivedStateFromError(error: unknown): TestErrorBoundaryState {
      return {
        componentStack: "",
        error,
        eventId: "event-id",
      };
    }

    componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
      const componentStack = errorInfo.componentStack || "";
      this.props.beforeCapture?.({ setTag: mocks.sentrySetTag }, error, componentStack);
      this.props.onError?.(error, componentStack, "event-id");
    }

    resetError = () => {
      this.setState(null);
    };

    render() {
      if (!this.state) {
        return this.props.children;
      }

      if (typeof this.props.fallback === "function") {
        return this.props.fallback({
          error: this.state.error,
          componentStack: this.state.componentStack,
          eventId: this.state.eventId,
          resetError: this.resetError,
        });
      }

      return this.props.fallback || null;
    }
  }

  return { ErrorBoundary };
});

vi.mock("./hooks/useVersionReload", () => ({
  useVersionReload: () => ({
    modal: mocks.versionModal,
    onReload: mocks.onReload,
    refetch: mocks.refetchVersion,
  }),
}));

vi.mock("./shared/ConfirmationModal", async () => {
  const { useTheme } = await vi.importActual<typeof import("@mui/material")>("@mui/material");

  return {
    ConfirmationModal: () => {
      const theme = useTheme();

      return <div data-testid="version-modal" data-theme-mode={theme.palette.mode} />;
    },
  };
});

vi.mock("./trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    {
      dark: "true",
    },
  ],
}));

vi.mock("./sound/sound.context", () => ({
  SoundProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="sound-provider">{children}</div>
  ),
}));

vi.mock("./trucoshi/trucoshi.context", () => ({
  TrucoshiProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="trucoshi-provider">{children}</div>
  ),
}));

vi.mock("notistack", () => ({
  SnackbarProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="snackbar-provider">{children}</div>
  ),
}));

const ThrowingChild = ({ error }: { error: Error }) => {
  throw error;
};

const silenceReactErrorLogs = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const preventDefault = (event: ErrorEvent) => event.preventDefault();
  window.addEventListener("error", preventDefault);
  return () => window.removeEventListener("error", preventDefault);
};

describe("AppProvider", () => {
  beforeEach(() => {
    mocks.onReload.mockClear();
    mocks.refetchVersion.mockClear();
    mocks.sentrySetTag.mockClear();
  });

  it("wraps app children with the shared providers", () => {
    render(
      <AppProvider>
        <div>App content</div>
      </AppProvider>
    );

    expect(screen.getByTestId("snackbar-provider")).toBeInTheDocument();
    expect(screen.getByTestId("trucoshi-provider")).toBeInTheDocument();
    expect(screen.getByTestId("sound-provider")).toBeInTheDocument();
    expect(screen.getByText("App content")).toBeInTheDocument();
    expect(screen.getByTestId("version-modal")).toBeInTheDocument();
    expect(screen.getByTestId("version-modal")).toHaveAttribute("data-theme-mode", "dark");
  });

  it("reloads once when any app child fails on a dynamic import error", async () => {
    const restoreReactErrorLogs = silenceReactErrorLogs();

    try {
      render(
        <AppProvider>
          <ThrowingChild
            error={new Error("Failed to fetch dynamically imported module: /assets/Profile.js")}
          />
        </AppProvider>
      );

      expect(screen.getByRole("status", { name: /recargando/i })).toBeInTheDocument();
      expect(screen.getByTestId("version-modal")).toBeInTheDocument();

      await waitFor(() => {
        expect(mocks.onReload).toHaveBeenCalledTimes(1);
      });
      expect(mocks.refetchVersion).not.toHaveBeenCalled();
      expect(mocks.sentrySetTag).toHaveBeenCalledWith("boundary", "app-provider");
      expect(mocks.sentrySetTag).toHaveBeenCalledWith("dynamic_import_error", "true");
    } finally {
      restoreReactErrorLogs();
    }
  });

  it("refetches the app version once for non-dynamic child errors", async () => {
    const restoreReactErrorLogs = silenceReactErrorLogs();

    try {
      render(
        <AppProvider>
          <ThrowingChild error={new Error("App child failed to render")} />
        </AppProvider>
      );

      expect(screen.getByText("No pudimos cargar Trucoshi")).toBeInTheDocument();
      expect(screen.getByTestId("version-modal")).toBeInTheDocument();

      await waitFor(() => {
        expect(mocks.refetchVersion).toHaveBeenCalledTimes(1);
      });
      expect(mocks.onReload).not.toHaveBeenCalled();
      expect(mocks.sentrySetTag).toHaveBeenCalledWith("boundary", "app-provider");
      expect(mocks.sentrySetTag).not.toHaveBeenCalledWith("dynamic_import_error", "true");

      fireEvent.click(screen.getByRole("button", { name: /recargar/i }));

      expect(mocks.onReload).toHaveBeenCalledTimes(1);
    } finally {
      restoreReactErrorLogs();
    }
  });
});
