import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { Sidebar } from "./Sidebar";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  setSidebarOpen: vi.fn(),
  state: {
    isSidebarOpen: false,
    account: { id: 1, name: "Player 0", role: "USER" },
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

const renderSidebar = () => renderWithTheme(<Sidebar />);

describe("Sidebar", () => {
  beforeEach(() => {
    mocks.logout.mockClear();
    mocks.setSidebarOpen.mockClear();
    mocks.state.isSidebarOpen = false;
    mocks.state.account = { id: 1, name: "Player 0", role: "USER" };
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
    expect(screen.getByTestId("sidebar-backdrop")).toHaveStyle({ zIndex: "1201" });
    expect(screen.getByTestId("sidebar-panel")).toHaveStyle({ zIndex: "1202" });

    fireEvent.click(screen.getByTestId("sidebar-backdrop"));

    expect(mocks.setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it("keeps account actions in a separate bottom section", async () => {
    mocks.state.isSidebarOpen = true;
    renderSidebar();

    await screen.findByText("Play menu");
    expect(screen.getByTestId("sidebar-scroll-area")).toHaveTextContent("Play menu");
    expect(screen.getByTestId("sidebar-bottom-actions")).toHaveTextContent("Inventario");
    expect(screen.getByTestId("sidebar-bottom-actions")).toHaveTextContent("Cerrar Sesion");
    expect(screen.getByTestId("sidebar-bottom-actions")).not.toHaveTextContent("Admin");
  });

  it("shows the admin action for admin accounts", () => {
    mocks.state.isSidebarOpen = true;
    mocks.state.account = { id: 1, name: "Admin", role: "ADMIN" };
    renderSidebar();

    expect(screen.getByTestId("sidebar-bottom-actions")).toHaveTextContent("Admin");
  });
});
