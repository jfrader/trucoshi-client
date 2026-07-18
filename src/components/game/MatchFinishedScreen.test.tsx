import { fireEvent, screen, waitFor } from "@testing-library/react";
import { EClientEvent } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { MatchFinishedScreen } from "./MatchFinishedScreen";

const navigate = vi.fn();
const socketEmit = vi.fn();
const joinQueue = vi.fn();
const setQueueReplayOptions = vi.fn();
const onPlayAgain = vi.fn();
const retryAdmission = vi.fn();

let canStartNewGames = true;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ key: "match" }),
    useNavigate: () => navigate,
  };
});

vi.mock("../../api/hooks/useMe", () => ({
  useMe: () => ({ refetch: vi.fn() }),
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{}, { setQueueReplayOptions }, { emit: socketEmit }],
}));

vi.mock("../../trucoshi/hooks/useMatchQueue", () => ({
  useMatchQueue: () => ({ joinQueue }),
}));

vi.mock("../../trucoshi/hooks/useGameAdmission", () => ({
  useGameAdmission: () => ({
    canStartNewGames,
    isDraining: !canStartNewGames,
    retryAdmission,
  }),
}));

vi.mock("./MatchBackdrop", () => ({
  MatchBackdrop: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../shared/SocketBackdrop", () => ({
  SocketBackdrop: () => null,
}));

vi.mock("./MatchPoints", () => ({
  MatchPoints: () => <div />,
}));

vi.mock("../chat/ChatRoom", () => ({
  ChatRoom: () => <div />,
}));

vi.mock("../../shared/UserAvatar", () => ({
  UserAvatar: ({ account }: any) => <span>{account.name}</span>,
}));

vi.mock("../../shared/Link", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={typeof to === "string" ? to : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("./EmojiRain", () => ({
  EmojiRain: () => null,
}));

const buildFinishedMatch = (overrides: any = {}) => ({
  id: 1,
  createdFromQueue: false,
  queueOptions: undefined,
  options: { satsPerPlayer: 0 },
  matchSessionId: "finished-match",
  previousHand: null,
  me: { teamIdx: 0 },
  winner: {
    id: 0,
    players: [{ key: "p1", name: "Player 1" }],
    points: { malas: 0, buenas: 9 },
  },
  ...overrides,
});

const renderFinishedScreen = (match: any) =>
  renderWithTheme(
    <MatchFinishedScreen
      match={match}
      error={null}
      chatProps={{} as any}
      onPlayAgain={onPlayAgain}
    />,
  );

describe("MatchFinishedScreen play again", () => {
  beforeEach(() => {
    navigate.mockClear();
    socketEmit.mockClear();
    joinQueue.mockClear();
    setQueueReplayOptions.mockClear();
    onPlayAgain.mockClear();
    retryAdmission.mockClear();
    canStartNewGames = true;
    joinQueue.mockResolvedValue(true);
  });

  it("starts the original queue again for queue-created matches", async () => {
    const queueOptions = { maxPlayers: 0, allowBots: true };
    renderFinishedScreen(buildFinishedMatch({ createdFromQueue: true, queueOptions }));

    expect(setQueueReplayOptions).toHaveBeenCalledWith(queueOptions);

    fireEvent.click(screen.getByRole("button", { name: /jugar de nuevo/i }));

    expect(joinQueue).toHaveBeenCalledWith(queueOptions);
    await waitFor(() =>
      expect(socketEmit).toHaveBeenCalledWith(EClientEvent.LEAVE_MATCH, "finished-match"),
    );
    expect(navigate).toHaveBeenCalledWith("/");
    expect(onPlayAgain).not.toHaveBeenCalled();
  });

  it("keeps custom play again behavior for custom matches", () => {
    renderFinishedScreen(buildFinishedMatch());

    fireEvent.click(screen.getByRole("button", { name: /jugar de nuevo/i }));

    expect(onPlayAgain).toHaveBeenCalled();
    expect(joinQueue).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("blocks play again while admission is draining", () => {
    canStartNewGames = false;
    renderFinishedScreen(buildFinishedMatch());

    expect(screen.getByText(/nuevas partidas en pausa/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jugar de nuevo/i })).toBeDisabled();

    expect(onPlayAgain).not.toHaveBeenCalled();
    expect(joinQueue).not.toHaveBeenCalled();
  });

  it("stays on the result when replay queue admission is rejected", async () => {
    const queueOptions = { maxPlayers: 0, allowBots: true };
    joinQueue.mockResolvedValueOnce(false);
    renderFinishedScreen(buildFinishedMatch({ createdFromQueue: true, queueOptions }));

    fireEvent.click(screen.getByRole("button", { name: /jugar de nuevo/i }));

    await waitFor(() => expect(joinQueue).toHaveBeenCalledWith(queueOptions));
    expect(socketEmit).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
