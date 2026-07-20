import { fireEvent, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { IPlayedCard, IPublicMatch } from "trucoshi";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildMatch, buildPlayers, buildRounds, buildSlots } from "../../test/fixtures/gameFixtures";
import { MatchGameplayProvider } from "./MatchGameplayContext";
import { TrickCenter } from "./TrickCenter";

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card, shadow, width }: { card: string; shadow?: boolean; width: string }) => (
    <div data-testid="trick-card" data-shadow={String(Boolean(shadow))} data-width={width}>
      {card}
    </div>
  ),
}));

const getRotation = (transform: string) => transform.match(/rotate\(([-\d.]+)deg\)/)?.[1];

const renderCenter = (match: IPublicMatch, rounds: IPlayedCard[][], sibling?: ReactNode) => {
  const players = match.players;

  return renderWithTheme(
    <BoardLayoutProvider surface="match" totalSeats={players.length}>
      <MatchGameplayProvider
        state={{
          match,
          chatProps: {} as any,
          slots: buildSlots(players),
          rounds,
          isDesktopChat: false,
          canSay: false,
          pauseRequested: false,
          me: match.me,
          serverAheadTime: 0,
          hasCommandActions: false,
          canInteractWithHand: false,
        }}
        score={{
          myTeamIdx: 0,
          myTeamPoints: 12,
          myTeamPointsLabel: "Malas",
          opponentTeamPoints: 9,
          opponentTeamPointsLabel: "Malas",
        }}
        seat={{
          bottomLeaderSeatIndex: 0,
          frontLeaderSeatIndex: Math.floor(players.length / 2),
        }}
        announcements={{
          latestAnnouncement: null,
          previousAnnouncement: null,
          thirdAnnouncement: null,
          latestAnnouncementColor: "grey.100",
          previousAnnouncementColor: "grey.400",
          thirdAnnouncementColor: "grey.500",
          animateAnnouncement: false,
        }}
        actions={{
          onPlayCard: vi.fn(),
          sayCommand: vi.fn(),
          pauseMatch: vi.fn(),
          setRulesOpen: vi.fn(),
          setAbandonOpen: vi.fn(),
        }}
      >
        <TrickCenter />
        {sibling}
      </MatchGameplayProvider>
    </BoardLayoutProvider>,
  );
};

describe("TrickCenter visual guard", () => {
  it("keeps all played cards visible across three rounds", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    const rounds = buildRounds(players);
    const { container } = renderCenter(match, rounds);

    expect(screen.getAllByTestId("trick-card")).toHaveLength(12);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("scales a foreground stack only for direct hover or touch inspection", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    renderCenter(match, buildRounds(players));

    const stack = screen.getByTestId("trick-stack-p1");
    const card = screen.getByTestId("trick-card-p1-0");
    const topCard = screen.getByTestId("trick-card-p1-2");
    const renderedCard = screen.getAllByTestId("trick-card")[0];
    const restingPosition = window.getComputedStyle(card).transform;
    const restingWidth = window.getComputedStyle(card).width;

    expect(stack).toHaveAttribute("aria-expanded", "false");
    expect(stack).toHaveStyle({ pointerEvents: "auto" });
    expect(card).toHaveStyle({ boxShadow: "none" });
    expect(topCard).toHaveStyle({ boxShadow: "0 2px 3px rgba(0,0,0,0.16)" });
    expect(renderedCard).toHaveAttribute("data-shadow", "false");
    expect(renderedCard).toHaveAttribute("data-width", "100%");

    fireEvent.pointerEnter(stack, { pointerType: "mouse" });

    expect(stack).toHaveAttribute("aria-expanded", "true");
    expect(card).toHaveStyle({ boxShadow: "0 8px 12px rgba(0,0,0,0.24)" });
    expect(window.getComputedStyle(card).width).not.toBe(restingWidth);
    expect(window.getComputedStyle(card).width).toMatch(/\*\s*1\.45/);
    expect(window.getComputedStyle(card).transform).toMatch(/\*\s*-0\.52/);
    expect(getRotation(window.getComputedStyle(card).transform)).not.toBe(
      getRotation(restingPosition),
    );

    fireEvent.pointerDown(stack, { pointerType: "mouse" });
    fireEvent.click(stack);
    expect(stack).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerLeave(stack, { pointerType: "mouse" });
    expect(stack).toHaveAttribute("aria-expanded", "false");
    expect(window.getComputedStyle(card).width).toBe(restingWidth);

    fireEvent.click(stack);
    expect(stack).toHaveAttribute("aria-expanded", "true");
  });

  it("opens and transfers touch inspection between player stacks in one tap", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    renderCenter(match, buildRounds(players));

    const firstStack = screen.getByTestId("trick-stack-p1");
    const secondStack = screen.getByTestId("trick-stack-p2");

    fireEvent.pointerDown(firstStack, { pointerType: "touch" });
    fireEvent.click(firstStack);
    expect(firstStack).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(secondStack, { pointerType: "touch" });
    fireEvent.click(secondStack);
    expect(firstStack).toHaveAttribute("aria-expanded", "false");
    expect(secondStack).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(secondStack, { pointerType: "touch" });
    fireEvent.click(secondStack);
    expect(secondStack).toHaveAttribute("aria-expanded", "false");
  });

  it("closes touch inspection when the next pointer interaction is outside the stacks", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    renderCenter(
      match,
      buildRounds(players),
      <button type="button" data-testid="play-card-outside-stack">
        Jugar carta
      </button>,
    );

    const stack = screen.getByTestId("trick-stack-p1");
    fireEvent.pointerDown(stack, { pointerType: "touch" });
    fireEvent.click(stack);
    expect(stack).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(screen.getByTestId("play-card-outside-stack"), {
      pointerType: "touch",
    });
    expect(stack).toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard inspection", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    renderCenter(match, buildRounds(players));
    const stack = screen.getByTestId("trick-stack-p1");

    fireEvent.keyDown(stack, { key: "Enter" });
    expect(stack).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(stack, { key: " " });
    expect(stack).toHaveAttribute("aria-expanded", "false");
  });
});
