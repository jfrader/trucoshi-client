import { screen } from "@testing-library/react";
import { renderWithTheme } from "../test/renderWithTheme";
import { Rulebook } from "./Rulebook";

vi.mock("../components/help/CardRanking", () => ({
  CardRanking: ({ title, compact }: any) => <div data-compact={String(compact)}>{title}</div>,
}));

const renderRulebook = (language: "es" | "en") => renderWithTheme(<Rulebook language={language} />);

describe("Rulebook", () => {
  it("renders the Spanish Markdown rulebook as HTML", () => {
    renderRulebook("es");

    expect(
      screen.getByRole("heading", { name: /reglas del truco, para tener a mano/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pica-pica existe solo en partidas de 6 jugadores/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Ranking visual de cartas")).toHaveAttribute("data-compact", "true");
    expect(screen.getByTestId("rulebook-content-after-ranking")).toHaveTextContent(
      /la carta más alta gana/i,
    );
    expect(screen.queryByText("1 de espada")).not.toBeInTheDocument();
  });

  it("renders the English Markdown rulebook as HTML", () => {
    renderRulebook("en");

    expect(
      screen.getByRole("heading", { name: /argentinian truco rules, within reach/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pica-pica only exists in 6-player matches/i)).toBeInTheDocument();
    expect(screen.getByText("Visual card ranking")).toHaveAttribute("data-compact", "true");
    expect(screen.getByTestId("rulebook-content-after-ranking")).toHaveTextContent(
      /the highest card wins/i,
    );
    expect(screen.queryByText("1 of swords")).not.toBeInTheDocument();
  });
});
