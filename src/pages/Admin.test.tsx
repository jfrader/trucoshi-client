import { fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EClientEvent, IAdminDashboard } from "trucoshi";
import { renderWithTheme } from "../test/renderWithTheme";
import { Admin } from "./Admin";

const dashboard: IAdminDashboard = {
  onlineAccounts: [{ accountId: 2, name: "Player 2", role: "USER", online: true }],
  liveGames: [
    {
      ownerId: "Player 2",
      matchSessionId: "match-1",
      players: 2,
      options: {
        maxPlayers: 4,
        faltaEnvido: 1,
        flor: false,
        matchPoint: 15,
        handAckTime: 0,
        turnTime: 0,
        abandonTime: 0,
        satsPerPlayer: 0,
      },
      state: "STARTED" as any,
      winnerTeamIdx: undefined,
      createdFromQueue: false,
    },
  ],
  rewardCodes: [
    {
      id: 3,
      codePreview: "ABC...123",
      createdByAccountId: 1,
      createdAt: "2026-07-01T12:00:00.000Z",
      redeemedAt: null,
      redeemedByAccountId: null,
      treasureChestId: null,
      note: "launch",
    },
  ],
};

const mocks = vi.hoisted(() => ({
  state: {
    account: { id: 1, name: "Admin", role: "ADMIN" },
    isConnected: true,
  },
  emit: vi.fn(),
  socket: null as any,
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

mocks.socket = { emit: mocks.emit };

vi.mock("../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state, {}, mocks.socket],
}));

vi.mock("../hooks/useToast", () => ({
  useToast: () => ({
    success: mocks.toastSuccess,
    error: mocks.toastError,
  }),
}));

const renderAdmin = () =>
  renderWithTheme(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );

describe("Admin page", () => {
  beforeEach(() => {
    mocks.state.account = { id: 1, name: "Admin", role: "ADMIN" };
    mocks.state.isConnected = true;
    mocks.emit.mockImplementation((event: EClientEvent, ...args: any[]) => {
      if (event === EClientEvent.ADMIN_FETCH_DASHBOARD) {
        args[0]({ success: true, dashboard });
      }

      if (event === EClientEvent.ADMIN_CREATE_CHEST_REWARD_CODE) {
        args[1]({
          success: true,
          code: "NEWCODE12345",
          link: "https://trucoshi.com/?code=NEWCODE12345",
          rewardCode: {
            id: 4,
            codePreview: "NEW...345",
            createdByAccountId: 1,
            intendedAccountId: null,
            note: args[0].note,
            createdAt: "2026-07-01T12:30:00.000Z",
            redeemedAt: null,
            redeemedByAccountId: null,
            treasureChestId: null,
          },
        });
      }
    });
  });

  it("blocks non-admin accounts", () => {
    mocks.state.account = { id: 2, name: "Player", role: "USER" };

    renderAdmin();

    expect(screen.getByText("No disponible para esta cuenta.")).toBeInTheDocument();
    expect(mocks.emit).not.toHaveBeenCalled();
  });

  it("loads admin dashboard tables", async () => {
    renderAdmin();

    expect(await screen.findAllByText("Player 2")).toHaveLength(2);
    expect(screen.getByText("match-1")).toBeInTheDocument();
    expect(screen.getByText("ABC...123")).toBeInTheDocument();
  });

  it("creates a chest reward code", async () => {
    renderAdmin();

    fireEvent.change(screen.getByLabelText("Nota"), { target: { value: "ops" } });
    fireEvent.click(screen.getByRole("button", { name: /crear cofre/i }));

    await waitFor(() => {
      expect(screen.getByText("https://trucoshi.com/?code=NEWCODE12345")).toBeInTheDocument();
    });
    expect(await screen.findByText("NEW...345")).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Codigo creado");
  });
});
