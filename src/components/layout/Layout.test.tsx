import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import {
  getNoticeBannerDismissalValue,
  NOTICE_BANNER_DISMISSED_KEY,
} from "../notice/NoticeBannerSlot";

const mocks = vi.hoisted(() => ({
  inspectCard: vi.fn(),
  state: {
    cardDisplayMode: "skins",
    dark: "true",
    inspectedCard: null,
    isSidebarOpen: false,
    noticeBanner: null as any,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({}),
}));

vi.mock("../../hooks/useConfirmationModal", () => ({
  useConfirmationModal: () => ({}),
}));

vi.mock("../../shared/CardBackdrop", () => ({
  CardBackdrop: () => null,
}));

vi.mock("../../shared/ConfirmationModal", () => ({
  ConfirmationModal: () => null,
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state, { inspectCard: mocks.inspectCard }],
}));

vi.mock("../reward/RewardCodeHandler", () => ({
  RewardCodeHandler: () => null,
}));

vi.mock("./Topbar", () => ({
  Topbar: ({ embedded, compact }: { embedded?: boolean; compact?: boolean }) => (
    <div
      data-compact={compact ? "true" : "false"}
      data-embedded={embedded ? "true" : "false"}
      data-testid={embedded ? "embedded-topbar" : "main-topbar"}
    />
  ),
}));

vi.mock("./Sidebar", () => ({
  Sidebar: ({ showEmbeddedTopbar }: { showEmbeddedTopbar?: boolean }) => (
    <div
      data-show-embedded-topbar={showEmbeddedTopbar ? "true" : "false"}
      data-testid="sidebar"
    />
  ),
}));

const renderLayout = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <Layout>
              <div>Page content</div>
            </Layout>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("Layout game topbar", () => {
  beforeAll(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) || null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
  });

  beforeEach(() => {
    mocks.inspectCard.mockClear();
    mocks.state.isSidebarOpen = false;
    mocks.state.noticeBanner = null;
    window.localStorage.clear();
  });

  it("shows the floating game topbar while the sidebar is closed", () => {
    renderLayout("/match/session-1");

    expect(screen.getByTestId("embedded-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-show-embedded-topbar", "true");
  });

  it("hides the floating game topbar while the sidebar is open", () => {
    mocks.state.isSidebarOpen = true;
    renderLayout("/lobby/session-1");

    expect(screen.queryByTestId("embedded-topbar")).not.toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-show-embedded-topbar", "true");
  });

  it("dismisses the global notice banner until the notice changes", async () => {
    mocks.state.noticeBanner = {
      id: 1,
      text: "Mantenimiento esta noche",
      severity: "warning",
      buttonText: null,
      buttonHref: null,
      updatedAt: "2026-07-01T12:00:00.000Z",
    };

    renderLayout("/");

    expect(screen.getByText("Mantenimiento esta noche")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cerrar aviso/i }));

    await waitFor(() => {
      expect(screen.queryByText("Mantenimiento esta noche")).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem(NOTICE_BANNER_DISMISSED_KEY)).toBe(
      getNoticeBannerDismissalValue(1, "2026-07-01T12:00:00.000Z")
    );

    mocks.state.noticeBanner = {
      ...mocks.state.noticeBanner,
      updatedAt: "2026-07-01T12:30:00.000Z",
    };
    renderLayout("/");

    expect(screen.getByText("Mantenimiento esta noche")).toBeInTheDocument();
  });
});
