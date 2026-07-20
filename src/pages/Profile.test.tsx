import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithTheme } from "../test/renderWithTheme";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { Profile } from "./Profile";

const mocks = vi.hoisted(() => ({
  emit: vi.fn(),
  isMePending: false,
  me: null as { id: number; name: string } | null,
}));

vi.mock("../api/hooks/useMe", () => ({
  useMe: () => ({ me: mocks.me, isPending: mocks.isMePending }),
}));

vi.mock("../shared/UserAvatar", () => ({
  UserAvatar: () => <div data-testid="profile-avatar" />,
}));

const accountResponse = {
  success: true,
  account: { id: 20, name: "Satoshi" },
  stats: { win: 3, loss: 1 },
  matches: [
    {
      id: 7,
      sessionId: "history-session",
      createdAt: "2026-07-10T12:00:00.000Z",
      winnerIdx: 0,
      bet: null,
      players: [{ accountId: 20, teamIdx: 0, name: "Satoshi", bot: false }],
    },
  ],
};

const renderProfile = (entry = "/profile/20") =>
  renderWithTheme(
    <MemoryRouter initialEntries={[entry]}>
      <TrucoshiContext.Provider
        value={
          {
            state: { isConnected: true },
            dispatch: {},
            socket: { emit: mocks.emit },
          } as never
        }
      >
        <Routes>
          <Route path="/profile/:accountId" element={<Profile />} />
          <Route path="/history/:matchId" element={<div>Detalle de partida</div>} />
        </Routes>
      </TrucoshiContext.Provider>
    </MemoryRouter>,
  );

describe("public Profile", () => {
  beforeEach(() => {
    mocks.emit.mockReset();
    mocks.emit.mockImplementation((_event, _accountId, callback) => callback(accountResponse));
    mocks.isMePending = false;
    mocks.me = null;
  });

  it("renders public identity and stats without account controls", async () => {
    renderProfile();

    expect(await screen.findByRole("heading", { name: "Satoshi" })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Secciones del perfil" })).toBeInTheDocument();
    expect(screen.getAllByText("75%")).toHaveLength(2);
    expect(screen.queryByText("Contraseña")).not.toBeInTheDocument();
    expect(screen.queryByText("Frase de recuperación")).not.toBeInTheDocument();
  });

  it("switches to public match history and opens a match", async () => {
    renderProfile();

    await screen.findByText("Resumen del jugador");
    userEvent.click(screen.getByRole("tab", { name: "Historial" }));
    userEvent.click(await screen.findByRole("button", { name: /Victoria/i }));

    expect(await screen.findByText("Detalle de partida")).toBeInTheDocument();
  });
});
