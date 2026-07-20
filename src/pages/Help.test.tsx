import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "../test/renderWithTheme";
import { Help } from "./Help";

vi.mock("../components/help/TrucoHelp", () => ({
  TrucoHelp: () => <div>Truco resources</div>,
}));

vi.mock("../components/help/BitcoinHelp", () => ({
  BitcoinHelp: () => <div>Bitcoin resources</div>,
}));

describe("Help", () => {
  it("orients players to both local rulebooks and the help topics", () => {
    renderWithTheme(
      <MemoryRouter>
        <Help />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Todo para jugar una buena mano" }),
    ).toBeVisible();
    expect(screen.getAllByRole("link", { name: /leer las reglas/i })[0]).toHaveAttribute(
      "href",
      "/rules",
    );
    expect(screen.getAllByRole("link", { name: /rules in english/i })[0]).toHaveAttribute(
      "href",
      "/rules/en",
    );
    expect(screen.getByText("Truco resources")).toBeInTheDocument();
    expect(screen.getByText("Bitcoin resources")).toBeInTheDocument();
  });
});
