import { fireEvent, screen } from "@testing-library/react";
import { EClientEvent } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { MatchFinishedScreen } from "./MatchFinishedScreen";

const navigate = vi.fn();
const socketEmit = vi.fn();
const joinQueue = vi.fn();
const setQueueReplayOptions = vi.fn();
const fetchTreasureStatus = vi.fn();
const openTreasureChest = vi.fn();
const devGrantTreasureChest = vi.fn();
const onPlayAgain = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../../api/hooks/useMe", () => ({
  useMe: () => ({ refetch: vi.fn() }),
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    {
      treasureStatus: {
        progress: 2,
        threshold: 3,
        unopenedChests: [{ id: 7, earnedAt: "2026-07-01T00:00:00.000Z" }],
      },
      treasureLoading: false,
      treasureOpening: false,
      treasureResult: null,
    },
    { devGrantTreasureChest, fetchTreasureStatus, openTreasureChest, setQueueReplayOptions },
    { emit: socketEmit },
  ],
}));

vi.mock("../../trucoshi/hooks/useMatchQueue", () => ({
  useMatchQueue: () => ({ joinQueue }),
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
  ChatRoom: () => <div data-testid="finished-match-chat" />,
}));

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card, cardSkinId, displayMode }: any) => (
    <div
      data-testid={`game-card-${card}`}
      data-card-skin-id={cardSkinId || ""}
      data-display-mode={displayMode}
    />
  ),
  FlipGameCard: ({ card, cardSkinId, displayMode, flip }: any) => (
    <div
      data-testid={`flip-game-card-${card}`}
      data-card-skin-id={cardSkinId || ""}
      data-display-mode={displayMode}
      data-flip={flip ? "true" : "false"}
    />
  ),
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
  players: [
    { key: "p1", name: "Player 1", bot: false },
    { key: "p2", name: "Player 2", bot: false },
  ],
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
    fetchTreasureStatus.mockClear();
    openTreasureChest.mockClear();
    devGrantTreasureChest.mockClear();
    onPlayAgain.mockClear();
  });

  it("starts the original queue again without showing treasure progress for bot queue matches", () => {
    const queueOptions = { maxPlayers: 0, allowBots: true };
    renderFinishedScreen(
      buildFinishedMatch({
        createdFromQueue: true,
        queueOptions,
        players: [
          { key: "p1", name: "Player 1", bot: false },
          { key: "p2", name: "Holdbot", bot: true },
        ],
      }),
    );

    expect(setQueueReplayOptions).toHaveBeenCalledWith(queueOptions);
    expect(fetchTreasureStatus).not.toHaveBeenCalled();
    expect(screen.queryByTestId("treasure-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("finished-match-chat")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

    expect(joinQueue).toHaveBeenCalledWith(queueOptions);
    expect(socketEmit).toHaveBeenCalledWith(EClientEvent.LEAVE_MATCH, "finished-match");
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
    expect(onPlayAgain).not.toHaveBeenCalled();
  });

  it("opens an available treasure chest from a queue-created match", () => {
    const queueOptions = { maxPlayers: 2, allowBots: false };
    renderFinishedScreen(buildFinishedMatch({ createdFromQueue: true, queueOptions }));

    expect(fetchTreasureStatus).toHaveBeenCalled();
    expect(screen.getByTestId("finished-match-chat")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));

    expect(openTreasureChest).toHaveBeenCalledWith(7);
  });

  it("can dismiss finished-match treasure progress to reveal chat", () => {
    const queueOptions = { maxPlayers: 2, allowBots: false };
    renderFinishedScreen(buildFinishedMatch({ createdFromQueue: true, queueOptions }));

    expect(screen.getByTestId("treasure-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ocultar progreso de cofre/i }));

    expect(screen.queryByTestId("treasure-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("finished-match-chat")).toBeInTheDocument();
  });

  it("keeps custom play again behavior for custom matches", () => {
    renderFinishedScreen(buildFinishedMatch());

    fireEvent.click(screen.getByRole("button", { name: /jugar/i }));

    expect(onPlayAgain).toHaveBeenCalled();
    expect(joinQueue).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
