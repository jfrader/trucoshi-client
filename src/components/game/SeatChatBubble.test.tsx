import { screen, waitFor } from "@testing-library/react";
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

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("this message is...");
    });
  });

  it("places bubbles inward from radial seat geometry", () => {
    expect(getSeatChatBubblePlacement({ cos: 0, sin: 1 })).toBe("top");
    expect(getSeatChatBubblePlacement({ cos: 0, sin: -1 })).toBe("bottom");
    expect(getSeatChatBubblePlacement({ cos: 1, sin: 0 })).toBe("left");
    expect(getSeatChatBubblePlacement({ cos: -1, sin: 0 })).toBe("right");
  });
});
