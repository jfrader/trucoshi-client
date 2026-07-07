import { IChatMessage, IPublicChatRoom } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { FILTER_BY_TAB } from "./commTabs";
import { ChatRoom } from "./ChatRoom";

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    {
      noticeBanner: {
        id: 8,
        text: "Nuevo aviso de mesa",
        severity: "info",
        updatedAt: "2026-07-01T12:00:00.000Z",
      },
      stats: { onlinePlayers: [] },
    },
    { inspectCard: vi.fn() },
  ],
}));

const buildRoom = (messages: IChatMessage[]): IPublicChatRoom =>
  ({
    id: "room",
    messages,
  }) as IPublicChatRoom;

const buildChat = (id: string, userName: string, content: string): IChatMessage =>
  ({
    id,
    date: Math.floor(Date.now() / 1000),
    user: { key: id, name: userName },
    content,
    sound: false,
  }) as IChatMessage;

describe("ChatRoom", () => {
  it("renders the notice banner slot before room messages in match chat", () => {
    const roomMessage = buildChat("m1", "Player", "hola");

    const { container } = renderWithTheme(
      <ChatRoom
        alwaysVisible
        hideInput
        active
        setActive={vi.fn()}
        latestMessage={null}
        players={[]}
        maxPlayers={2}
        showNoticeBanner
        useChatState={[buildRoom([roomMessage]), vi.fn(), false, null]}
        messageFilter={FILTER_BY_TAB.chat}
      />,
    );

    const listText = container.querySelector(".MuiList-root")?.textContent || "";
    const noticeText = "Nuevo aviso de mesa";
    const chatText = "Player: hola";

    expect(listText).toContain(noticeText);
    expect(listText).toContain(chatText);
    expect(listText.indexOf(noticeText)).toBeLessThan(listText.indexOf(chatText));
  });
});
