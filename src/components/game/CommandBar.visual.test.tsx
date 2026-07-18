import { fireEvent, screen } from "@testing-library/react";
import { ETrucoCommand } from "trucoshi";
import { CommandBar } from "./CommandBar";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildPlayer } from "../../test/fixtures/gameFixtures";

describe("CommandBar visual guard", () => {
  it("renders action flow with snapshot and style guard", () => {
    const player = buildPlayer({
      key: "p1",
      teamIdx: 0,
      isTurn: true,
      commands: [ETrucoCommand.TRUCO],
      envido: [{ value: 27 } as any, { value: 31 } as any],
      isEnvidoTurn: true,
    });
    const onSayCommand = vi.fn();
    const { container } = renderWithTheme(
      <CommandBar player={player} canSay onSayCommand={onSayCommand} />
    );

    const trucoButton = screen.getByRole("button", { name: /truco/i });
    expect(trucoButton).toHaveStyle("text-transform: uppercase");
    fireEvent.click(trucoButton);
    expect(onSayCommand).toHaveBeenCalledWith(ETrucoCommand.TRUCO);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders waiting state when no actions are available", () => {
    const { container } = renderWithTheme(
      <CommandBar
        player={buildPlayer({ key: "p2", teamIdx: 1, commands: [], isEnvidoTurn: false })}
        canSay={false}
        onSayCommand={vi.fn()}
      />
    );

    expect(screen.getByText("Esperando jugada")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
