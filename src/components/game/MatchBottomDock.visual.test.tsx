import { screen } from "@testing-library/react";
import { ETrucoCommand } from "trucoshi";
import { MatchBottomDock } from "./MatchBottomDock";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildAnnouncements, buildPlayer } from "../../test/fixtures/gameFixtures";

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="game-card">{card}</div>,
}));

vi.mock("../chat/ChatRoom", () => ({
  getMessageContent: (message: { message?: string }) => message.message || "",
}));

describe("MatchBottomDock visual guard", () => {
  it("renders announcements, hand cards and command lane", () => {
    const me = buildPlayer({
      key: "p1",
      teamIdx: 0,
      isMe: true,
      isTurn: true,
      commands: [ETrucoCommand.TRUCO],
      hand: ["1e", "7o", "3c"],
    });
    const announcements = buildAnnouncements();
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="match" totalSeats={4}>
        <MatchBottomDock
          latestAnnouncement={announcements.latest}
          previousAnnouncement={announcements.previous}
          thirdAnnouncement={announcements.third}
          latestAnnouncementColor="warning.light"
          previousAnnouncementColor="grey.300"
          thirdAnnouncementColor="grey.400"
          animateAnnouncement={false}
          me={me}
          canSay
          hasCommandActions
          canInteractWithHand
          onPlayCard={vi.fn()}
          onSayCommand={vi.fn()}
          onOpenChat={vi.fn()}
        />
      </BoardLayoutProvider>
    );

    expect(screen.getByRole("button", { name: /abrir chat/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("game-card")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /truco/i })).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders spectator waiting mode with hidden hand placeholders", () => {
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="match" totalSeats={2}>
        <MatchBottomDock
          latestAnnouncement={null}
          previousAnnouncement={null}
          thirdAnnouncement={null}
          latestAnnouncementColor="grey.100"
          previousAnnouncementColor="grey.400"
          thirdAnnouncementColor="grey.500"
          animateAnnouncement={false}
          me={null}
          canSay={false}
          hasCommandActions={false}
          canInteractWithHand={false}
          onPlayCard={vi.fn()}
          onSayCommand={vi.fn()}
        />
      </BoardLayoutProvider>
    );

    expect(screen.getByText("Modo espectador")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
