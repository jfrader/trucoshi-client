import { fireEvent, screen } from "@testing-library/react";
import { PlayMenu } from "./PlayMenu";
import { renderWithTheme } from "../../test/renderWithTheme";
import {
  getNoticeBannerDismissalValue,
  NOTICE_BANNER_DISMISSED_KEY,
} from "../notice/NoticeBannerSlot";

const navigate = vi.fn();
const joinQueue = vi.fn();
const leaveQueue = vi.fn();
const createTutorialMatch = vi.fn();
const requestNotifications = vi.fn();
const setSidebarOpen = vi.fn();
const toastInfo = vi.fn();

let queueState = {
  status: null as any,
  isQueueing: false,
  notificationPermission: "unsupported" as NotificationPermission | "unsupported",
};
let activeMatches: any[] = [];
let queueReplayOptions: any = null;
let serverAheadTime = 0;
let noticeBanner: any = null;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={typeof to === "string" ? to : "#"} {...props}>
        {children}
      </a>
    ),
    useMatch: () => null,
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
      noticeBanner,
    },
    {
      setSidebarOpen,
    },
  ],
}));

vi.mock("../../trucoshi/hooks/useMatch", () => ({
  useMatch: () => [{}, { createTutorialMatch }],
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
    requestNotifications,
  }),
}));

describe("PlayMenu queue controls", () => {
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
    navigate.mockClear();
    joinQueue.mockClear();
    leaveQueue.mockClear();
    createTutorialMatch.mockReset();
    createTutorialMatch.mockImplementation((callback: any) =>
      callback(null, { matchSessionId: "tutorial-match" })
    );
    requestNotifications.mockClear();
    setSidebarOpen.mockClear();
    toastInfo.mockClear();
    activeMatches = [];
    queueReplayOptions = null;
    serverAheadTime = 0;
    noticeBanner = null;
    window.localStorage.clear();
    queueState = {
      status: null,
      isQueueing: false,
      notificationPermission: "unsupported",
    };
  });

  it("starts an any-size queue with bots disabled by default", () => {
    renderWithTheme(<PlayMenu />);

    expect(screen.getByLabelText(/completar con bots/i)).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /^jugar$/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 0, allowBots: false });
  });

  it("does not render a standalone notification prompt", () => {
    queueState = {
      status: null,
      isQueueing: false,
      notificationPermission: "default",
    };

    renderWithTheme(<PlayMenu />);

    expect(screen.queryByRole("button", { name: /notificaciones/i })).not.toBeInTheDocument();
  });

  it("uses the selected team size and enables bots when checked", () => {
    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: "2v2" }));
    fireEvent.click(screen.getByLabelText(/completar con bots/i));
    fireEvent.click(screen.getByRole("button", { name: /^jugar$/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 4, allowBots: true });
  });

  it("renders queued status and cancels the queue", () => {
    queueState = {
      isQueueing: true,
      notificationPermission: "unsupported",
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
    expect(screen.getByText("Buscando rivales")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancelar cola/i }));

    expect(leaveQueue).toHaveBeenCalled();
  });

  it("uses server-adjusted time for queued elapsed status", () => {
    const localNow = Date.now();
    serverAheadTime = -60_000;
    queueState = {
      isQueueing: true,
      notificationPermission: "unsupported",
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
    expect(screen.getByText("Buscando rivales")).toBeInTheDocument();
  });

  it("rejoins an existing queued match instead of queueing again", () => {
    activeMatches = [
      {
        matchSessionId: "queue-match",
        createdFromQueue: true,
      },
    ];

    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: /volver a la partida/i }));

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

    fireEvent.click(screen.getByRole("button", { name: /^jugar$/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 0, allowBots: false });
    expect(navigate).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
  });

  it("uses stored queue replay options for play again", () => {
    queueReplayOptions = { maxPlayers: 4, allowBots: false };

    renderWithTheme(<PlayMenu />);

    expect(screen.getByLabelText(/completar con bots/i)).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /^jugar$/i }));

    expect(joinQueue).toHaveBeenCalledWith({ maxPlayers: 4, allowBots: false });
  });

  it("lets replay queue options be changed before playing again", () => {
    queueReplayOptions = { maxPlayers: 4, allowBots: false };

    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByLabelText(/completar con bots/i));
    fireEvent.click(screen.getByRole("button", { name: /^jugar$/i }));

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

    fireEvent.click(screen.getByRole("button", { name: /volver a la partida/i }));

    expect(navigate).toHaveBeenCalledWith("/match/queue-match");
    expect(joinQueue).not.toHaveBeenCalled();
  });

  it("shows the home notice banner below the play button even after dismissal", () => {
    noticeBanner = {
      id: 7,
      text: "Mantenimiento esta noche",
      severity: "warning",
      buttonText: null,
      buttonHref: null,
      updatedAt: "2026-07-01T12:00:00.000Z",
    };
    window.localStorage.setItem(
      NOTICE_BANNER_DISMISSED_KEY,
      getNoticeBannerDismissalValue(noticeBanner.id, noticeBanner.updatedAt)
    );

    renderWithTheme(<PlayMenu showNoticeBanner />);

    expect(screen.getByText("Mantenimiento esta noche")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("creates a tutorial match and navigates to it", () => {
    renderWithTheme(<PlayMenu />);

    fireEvent.click(screen.getByRole("button", { name: /aprende a jugar/i }));

    expect(createTutorialMatch).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/match/tutorial-match");
  });
});
