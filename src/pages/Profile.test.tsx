import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithThemeAt } from "../test/renderWithTheme";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { Profile } from "./Profile";

const mocks = vi.hoisted(() => ({
  closeModal: vi.fn(),
  emit: vi.fn(),
  navigate: vi.fn(),
  openModal: vi.fn(),
  resetQueries: vi.fn(),
  searchStr: "?t=%222%22",
  toast: { error: vi.fn() },
  updateProfile: vi.fn(),
  setSeed: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
  const router = await vi.importActual<typeof import("@tanstack/react-router")>(
    "@tanstack/react-router",
  );

  return {
    ...router,
    useNavigate: () => mocks.navigate,
    useParams: () => ({ accountId: "20" }),
    useSearch: () => router.defaultParseSearch(mocks.searchStr),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ resetQueries: mocks.resetQueries }),
}));

vi.mock("../api/hooks/useMe", () => ({
  useMe: () => ({
    me: { id: 20, name: "Satoshi", email: null, hasSeed: false },
    isPending: false,
  }),
}));

vi.mock("../api/hooks/useUpdateProfile", () => ({
  useUpdateProfile: () => ({ updateProfile: mocks.updateProfile, isPending: false }),
}));

vi.mock("../api/hooks/useSetSeed", () => ({
  useSetSeed: () => ({ setSeed: mocks.setSeed, isPending: false }),
}));

vi.mock("../hooks/useToast", () => ({
  useToast: () => mocks.toast,
}));

vi.mock("../hooks/useConfirmationModal", () => ({
  useConfirmationModal: () => ({
    isOpen: false,
    onClose: mocks.closeModal,
    onOpen: mocks.openModal,
  }),
}));

vi.mock("../shared/ConfirmationModal", () => ({
  ConfirmationModal: () => null,
}));

vi.mock("../shared/UserAvatar", () => ({
  UserAvatar: () => <div data-testid="profile-avatar" />,
}));

describe("Profile tabs", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.searchStr = "?t=%222%22";
    mocks.emit.mockImplementation((_event, _accountId, callback) => {
      callback({
        success: true,
        account: { id: 20, name: "Satoshi" },
        stats: { win: 1, loss: 0 },
        matches: [
          {
            id: 7,
            sessionId: "history-session",
            createdAt: "2026-07-10T12:00:00.000Z",
            winnerIdx: 0,
            players: [{ accountId: 20, teamIdx: 0, name: "Satoshi" }],
          },
        ],
      });
    });
  });

  it("renders the history panel from TanStack's parsed search value", async () => {
    renderWithThemeAt(
      <TrucoshiContext.Provider
        value={
          {
            state: { isConnected: true },
            dispatch: {},
            socket: { emit: mocks.emit },
          } as never
        }
      >
        <Profile />
      </TrucoshiContext.Provider>,
      "/profile/20?t=%222%22",
    );

    expect(await screen.findByText("history-session")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Historial" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByText("Nombre")).not.toBeInTheDocument();
  });

  it("navigates to the selected tab with TanStack route params and search", async () => {
    const user = userEvent.setup();
    mocks.searchStr = "";

    renderWithThemeAt(
      <TrucoshiContext.Provider
        value={
          {
            state: { isConnected: true },
            dispatch: {},
            socket: { emit: mocks.emit },
          } as never
        }
      >
        <Profile />
      </TrucoshiContext.Provider>,
      "/profile/20",
    );

    await screen.findByText("Nombre");
    await user.click(screen.getByRole("tab", { name: "Historial" }));

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/profile/$accountId",
      params: { accountId: "20" },
      search: { t: "2" },
      replace: true,
    });
  });
});
