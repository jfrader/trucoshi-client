import { fireEvent, screen } from "@testing-library/react";
import { PlayMenu } from "./PlayMenu";
import { renderWithTheme } from "../../test/renderWithTheme";

const navigate = vi.fn();
const joinQueue = vi.fn();
const leaveQueue = vi.fn();
const toastInfo = vi.fn();

let queueState = {
  status: null as any,
  isQueueing: false,
};
let activeMatches: any[] = [];
let queueReplayOptions: any = null;
let serverAheadTime = 0;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={typeof to === "string" ? to : "#"} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => navigate,
  };
});

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    {
      account: null,
      stats: { onlinePlayers: [] },
      activeMatches,
      queueReplayOptions,
      serverAheadTime,
    },
  ],
}));

vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({
    info: toastInfo,
  }),
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
    toastInfo.mockClear();
    activeMatches = [];
    queueReplayOptions = null;
    serverAheadTime = 0;
    queueState = {
      status: null,
      isQueueing: false,
    };
  });

  it("starts an any-size queue with bots enabled by default", () => {
    renderWithTheme(<PlayMenu />);

    expect(screen.getByLabelText(/jugar con bots/i)).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 0, allowBots: true });
  });

  it("uses the selected team size and disables bots when unchecked", () => {
    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: "2v2" }));
    fireEvent.click(screen.getByLabelText(/jugar con bots/i));
    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

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
        queuedAt: Date.now() - 12_000,
        botFallbackAt: Date.now() + 5000,
      },
    };

    renderWithTheme(<PlayMenu />);

    expect(screen.getByText("1/2 jugadores")).toBeInTheDocument();
    expect(screen.getByText("Espera 0:12")).toBeInTheDocument();
    expect(screen.getByText(/bots en/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancelar cola/i }));

    expect(leaveQueue).toHaveBeenCalled();
  });

  it("uses server-adjusted time for queued elapsed status", () => {
    const localNow = Date.now();
    serverAheadTime = -60_000;
    queueState = {
      isQueueing: true,
      status: {
        requestId: "queue-1",
        maxPlayers: 2,
        queuedPlayers: 1,
        requiredPlayers: 2,
        position: 1,
        queuedAt: localNow + serverAheadTime,
        botFallbackAt: localNow + serverAheadTime + 5000,
      },
    };

    renderWithTheme(<PlayMenu />);

    expect(screen.getByText("Espera 0:00")).toBeInTheDocument();
    expect(screen.getByText(/bots en 5s/i)).toBeInTheDocument();
  });

  it("rejoins an existing queued match instead of queueing again", () => {
    activeMatches = [
      {
        matchSessionId: "queue-match",
        createdFromQueue: true,
      },
    ];

    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: /volver a partida/i }));

    expect(toastInfo).toHaveBeenCalledWith("Ya estás en una partida");
    expect(navigate).toHaveBeenCalledWith("/match/queue-match");
    expect(joinQueue).not.toHaveBeenCalled();
  });

  it("ignores custom active matches for the queue button", () => {
    activeMatches = [
      {
        matchSessionId: "custom-match",
        createdFromQueue: false,
      },
    ];

    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 0, allowBots: true });
    expect(navigate).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
  });

  it("uses stored queue replay options for play again", () => {
    queueReplayOptions = { maxPlayers: 4, allowBots: false };

    renderWithTheme(<PlayMenu />);

    expect(screen.getByLabelText(/jugar con bots/i)).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 4, allowBots: false });
  });

  it("lets replay queue options be changed before playing again", () => {
    queueReplayOptions = { maxPlayers: 4, allowBots: false };

    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByLabelText(/jugar con bots/i));
    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 4, allowBots: true });
  });

  it("prefers rejoining an active queued match over stored replay options", () => {
    queueReplayOptions = { maxPlayers: 4, allowBots: false };
    activeMatches = [
      {
        matchSessionId: "queue-match",
        createdFromQueue: true,
      },
    ];

    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: /volver a partida/i }));

    expect(toastInfo).toHaveBeenCalledWith("Ya estás en una partida");
    expect(navigate).toHaveBeenCalledWith("/match/queue-match");
    expect(joinQueue).not.toHaveBeenCalled();
  });
});
