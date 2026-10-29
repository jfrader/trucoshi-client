import { screen } from "@testing-library/react";
import { renderWithTheme } from "../test/renderWithTheme";
import { UserAvatar } from "./UserAvatar";

vi.mock("../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{ stats: { onlinePlayers: [42] } }],
}));

describe("avatar presence", () => {
  it("does not label untracked guests as disconnected", () => {
    renderWithTheme(<UserAvatar account={{ name: "Guest" }} />);
    expect(screen.queryByTitle("Desconectado")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Conectado")).not.toBeInTheDocument();
  });

  it("labels bots as bots rather than disconnected humans", () => {
    renderWithTheme(<UserAvatar account={{ name: "Bender", bot: true }} status />);
    expect(screen.getByTitle("Bot")).toBeInTheDocument();
    expect(screen.queryByTitle("Desconectado")).not.toBeInTheDocument();
  });

  it("derives tracked human presence from online account IDs without leaking styling props", () => {
    const error = vi.spyOn(console, "error");
    const { container, rerender } = renderWithTheme(
      <UserAvatar account={{ id: 42, name: "Connected" }} status />,
    );
    expect(screen.getByTitle("Conectado")).toBeInTheDocument();
    expect(container.querySelector("[online]")).toBeNull();
    rerender(<UserAvatar account={{ id: 43, name: "Offline" }} status />);
    expect(screen.getByTitle("Desconectado")).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
