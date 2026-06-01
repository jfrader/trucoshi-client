import { fireEvent, screen } from "@testing-library/react";
import { PlayMenu } from "./PlayMenu";
import { renderWithTheme } from "../../test/renderWithTheme";

const navigate = vi.fn();
const joinQueue = vi.fn();
const leaveQueue = vi.fn();

let queueState = {
  status: null as any,
  isQueueing: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{ account: null, stats: { onlinePlayers: [] } }],
}));

vi.mock("../../trucoshi/hooks/useMatchQueue", () => ({
  useMatchQueue: () => ({
    ...queueState,
    joinQueue,
    leaveQueue,
  }),
}));

describe("PlayMenu queue controls", () => {
  beforeEach(() => {
    navigate.mockClear();
    joinQueue.mockClear();
    leaveQueue.mockClear();
    queueState = {
      status: null,
      isQueueing: false,
    };
  });

  it("starts a 1v1 queue with bots allowed by default", () => {
    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: /buscar partida/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 2, allowBots: true });
  });

  it("uses the selected team size and disables bots when waiting for humans", () => {
    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: "2v2" }));
    fireEvent.click(screen.getByLabelText(/esperar humanos/i));
    fireEvent.click(screen.getByRole("button", { name: /buscar partida/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 4, allowBots: false });
  });

  it("renders queued status and cancels the queue", () => {
    queueState = {
      isQueueing: true,
      status: {
        requestId: "queue-1",
        maxPlayers: 2,
        queuedPlayers: 1,
        requiredPlayers: 2,
        position: 1,
        botFallbackAt: Date.now() + 5000,
      },
    };

    renderWithTheme(<PlayMenu />);

    expect(screen.getByText("1/2 jugadores")).toBeInTheDocument();
    expect(screen.getByText(/bots en/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancelar cola/i }));

    expect(leaveQueue).toHaveBeenCalled();
  });
});
