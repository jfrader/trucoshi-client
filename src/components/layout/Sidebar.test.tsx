import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "../../test/renderWithTheme";
import { Sidebar } from "./Sidebar";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  setSidebarOpen: vi.fn(),
  state: {
    isSidebarOpen: false,
    account: { id: 1, name: "Player 0" },
    activeMatches: [],
  },
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    mocks.state,
    {
      logout: mocks.logout,
      setSidebarOpen: mocks.setSidebarOpen,
    },
  ],
}));

vi.mock("../menu/PlayMenu", () => ({
  PlayMenu: ({ onMenuClick }: { onMenuClick?: () => void }) => (
    <button type="button" onClick={onMenuClick}>
      Play menu
    </button>
  ),
}));

vi.mock("../menu/WalletMenu", () => ({
  WalletMenu: () => <div>Wallet menu</div>,
}));

vi.mock("../game/MatchList", () => ({
  MatchList: () => <div>Partidas activas</div>,
}));

vi.mock("./Topbar", () => ({
  Topbar: () => <div>Topbar</div>,
}));

const renderSidebar = () =>
  renderWithTheme(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

describe("Sidebar", () => {
  beforeEach(() => {
    mocks.logout.mockClear();
    mocks.setSidebarOpen.mockClear();
    mocks.state.isSidebarOpen = false;
    mocks.state.account = { id: 1, name: "Player 0" };
    mocks.state.activeMatches = [];
  });

  it("does not render the backdrop or panel when closed", () => {
    renderSidebar();

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-panel")).not.toBeInTheDocument();
  });

  it("renders a backdrop while open and closes from outside click", () => {
    mocks.state.isSidebarOpen = true;
    renderSidebar();

    expect(screen.getByTestId("sidebar-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it("keeps account actions in a separate bottom section", () => {
    mocks.state.isSidebarOpen = true;
    renderSidebar();

    expect(screen.getByTestId("sidebar-scroll-area")).toHaveTextContent("Play menu");
    expect(screen.getByTestId("sidebar-bottom-actions")).toHaveTextContent("Inventario");
    expect(screen.getByTestId("sidebar-bottom-actions")).toHaveTextContent("Cerrar Sesion");
  });
});
