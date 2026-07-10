import { act, screen, waitFor } from "@testing-library/react";
import { IChatMessage, IPublicChatRoom } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildPlayer } from "../../test/fixtures/gameFixtures";
import { SeatChatBubble, getSeatChatBubblePlacement } from "./SeatChatBubble";

const buildRoom = (messages: IChatMessage[]): IPublicChatRoom =>
  ({
    id: "room",
    messages,
  }) as IPublicChatRoom;

const buildChat = (id: string, playerKey: string, content: string): IChatMessage =>
  ({
    id,
    date: Date.now(),
    user: { key: playerKey, name: "Player" },
    content,
    sound: false,
  }) as IChatMessage;

const buildTutorialChat = (
  id: string,
  playerKey: string,
  content: string,
  tutorialContext?: string,
): IChatMessage =>
  ({
    ...buildChat(id, playerKey, content),
    tutorial: true,
    tutorialContext,
  }) as IChatMessage;

describe("SeatChatBubble", () => {
  it("shows newly appended regular chat without showing room history first", async () => {
    const player = buildPlayer({ key: "p1", teamIdx: 0 });
    const firstMessage = buildChat("m1", player.key, "old message");
    const nextMessage = buildChat("m2", player.key, "new table message");
    const { rerender } = renderWithTheme(
      <SeatChatBubble player={player} room={buildRoom([firstMessage])} />,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<SeatChatBubble player={player} room={buildRoom([firstMessage, nextMessage])} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("new table message");
    });
  });

  it("shows tutorial chat from room history immediately", async () => {
    const player = buildPlayer({ key: "bot", teamIdx: 1, name: "Profe Truco" });
    const tutorialMessage = buildTutorialChat(
      "t1",
      player.key,
      "Bienvenido. Ganas el partido llegando a 9 puntos antes que el Profe.",
    );

    renderWithTheme(<SeatChatBubble player={player} room={buildRoom([tutorialMessage])} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Bienvenido");
    });
  });

  it("queues chained tutorial messages instead of replacing the visible bubble", async () => {
    vi.useFakeTimers();
    try {
      const player = buildPlayer({ key: "bot", teamIdx: 1, name: "Profe Truco" });
      const firstMessage = buildTutorialChat("t1", player.key, "Primero mira tus cartas.");
      const secondMessage = buildTutorialChat("t2", player.key, "Despues elegi la mejor jugada.");
      const { rerender } = renderWithTheme(
        <SeatChatBubble player={player} room={buildRoom([firstMessage])} />,
      );

      expect(screen.getByRole("status")).toHaveTextContent("Primero mira tus cartas.");

      rerender(<SeatChatBubble player={player} room={buildRoom([firstMessage, secondMessage])} />);

      expect(screen.getByRole("status")).toHaveTextContent("Primero mira tus cartas.");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(9500);
      });

      expect(screen.getByRole("status")).toHaveTextContent("Despues elegi la mejor jugada.");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("replaces stale tutorial bubbles when a newer tutorial context arrives", async () => {
    vi.useFakeTimers();
    try {
      const player = buildPlayer({ key: "bot", teamIdx: 1, name: "Profe Truco" });
      const oldMessage = buildTutorialChat(
        "t1",
        player.key,
        "Te queda el 7 de oro. Muy buena carta para definir.",
        "2:3:WAITING_PLAY:0:before_human_turn:none",
      );
      const newMessage = buildTutorialChat(
        "t2",
        player.key,
        "Tenes 33 de envido. Cantalo antes de jugar.",
        "3:1:WAITING_PLAY:0:before_human_turn:none",
      );
      const { rerender } = renderWithTheme(
        <SeatChatBubble player={player} room={buildRoom([oldMessage])} />,
      );

      expect(screen.getByRole("status")).toHaveTextContent("7 de oro");

      rerender(<SeatChatBubble player={player} room={buildRoom([oldMessage, newMessage])} />);

      expect(screen.getByRole("status")).toHaveTextContent("33 de envido");
      expect(screen.getByRole("status")).not.toHaveTextContent("7 de oro");
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("caps long messages before rendering the bubble", async () => {
    const player = buildPlayer({ key: "p1", teamIdx: 0 });
    const firstMessage = buildChat("m1", player.key, "old message");
    const nextMessage = buildChat(
      "m2",
      player.key,
      "this message is intentionally too long for a seat bubble",
    );
    const { rerender } = renderWithTheme(
      <SeatChatBubble player={player} room={buildRoom([firstMessage])} maxCharacters={18} />,
    );

    rerender(
      <SeatChatBubble
        player={player}
        room={buildRoom([firstMessage, nextMessage])}
        maxCharacters={18}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("this message is...");
  });

  it("places bubbles inward from radial seat geometry", () => {
    expect(getSeatChatBubblePlacement({ cos: 0, sin: 1 })).toBe("top");
    expect(getSeatChatBubblePlacement({ cos: 0, sin: -1 })).toBe("bottom");
    expect(getSeatChatBubblePlacement({ cos: 1, sin: 0 })).toBe("left");
    expect(getSeatChatBubblePlacement({ cos: -1, sin: 0 })).toBe("right");
  });
});
