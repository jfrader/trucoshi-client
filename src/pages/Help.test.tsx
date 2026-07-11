import { screen } from "@testing-library/react";
import { renderWithThemeAt } from "../test/renderWithTheme";
import { Help } from "./Help";

vi.mock("../config/features", () => ({
  ENABLE_BETS_AND_DEPOSITS: false,
}));

vi.mock("../components/help/TrucoHelp", () => ({
  TrucoHelp: () => <div>Herramientas de Truco</div>,
}));

describe("Help", () => {
  it("omits every Bitcoin and payment section when bets are disabled", () => {
    renderWithThemeAt(<Help />, "/help");

    expect(
      screen.getByRole("heading", { name: /ayuda para jugar al truco/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Herramientas de Truco")).toBeInTheDocument();
    expect(screen.queryByText(/bitcoin|lightning/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/entendé los pagos|pagos instantáneos/i)).not.toBeInTheDocument();
  });
});
