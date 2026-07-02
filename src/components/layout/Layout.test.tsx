import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";

const mocks = vi.hoisted(() => ({
  inspectCard: vi.fn(),
  state: {
    cardsReady: true,
    dark: "true",
    inspectedCard: null,
    isSidebarOpen: false,
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
  beforeEach(() => {
    mocks.inspectCard.mockClear();
    mocks.state.isSidebarOpen = false;
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
});
