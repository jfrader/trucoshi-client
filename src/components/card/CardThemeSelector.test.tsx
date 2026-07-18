import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { CardTheme } from "../../trucoshi/cardThemes";
import { CardThemeSelector } from "./CardThemeSelector";

const setCardTheme = vi.fn();
const inspectCard = vi.fn();
let cardTheme: CardTheme = "default";

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{ cardTheme }, { inspectCard, setCardTheme }],
}));

describe("CardThemeSelector", () => {
  beforeEach(() => {
    cardTheme = "default";
    setCardTheme.mockClear();
  });

  it("exposes exactly the three fixed shared themes", () => {
    renderWithTheme(<CardThemeSelector />);

    fireEvent.click(
      screen.getByRole("button", { name: "Mazo de cartas: Default" }),
    );

    expect(
      screen.getAllByRole("menuitem").map((item) => item.getAttribute("aria-label")),
    ).toEqual(["Default", "GNU", "Emoji"]);
    expect(screen.queryByText(/Criollo|custom|personalizado/i)).toBeNull();
  });

  it("persists the chosen theme through the global dispatch and closes", () => {
    renderWithTheme(<CardThemeSelector />);

    fireEvent.click(
      screen.getByRole("button", { name: "Mazo de cartas: Default" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "GNU" }));

    expect(setCardTheme).toHaveBeenCalledWith("gnu");
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
