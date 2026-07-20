import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "../test/renderWithTheme";
import { EnglishRulebook, Rulebook } from "./Rulebook";

vi.mock("../components/help/CardRanking", () => ({
  CardRanking: ({ title }: { title?: string }) => <div>{title}</div>,
}));

describe("Rulebook", () => {
  it("renders the Spanish rules as semantic content and links to English", () => {
    renderWithTheme(
      <MemoryRouter>
        <Rulebook />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Reglas del Truco" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Jugadores y equipos" })).toBeVisible();
    expect(screen.getByText("Ranking visual de cartas")).toBeVisible();
    expect(screen.queryByText("{{CARD_RANKING}}")).toBeNull();
    expect(screen.getByRole("link", { name: /read in english/i })).toHaveAttribute(
      "href",
      "/rules/en",
    );
  });

  it("renders the complete English rulebook", () => {
    renderWithTheme(
      <MemoryRouter>
        <EnglishRulebook />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "How to play Truco" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Players and Teams" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Pica-Pica" })).toBeVisible();
    expect(screen.getByText("Visual card ranking")).toBeVisible();
    expect(screen.getByRole("link", { name: /leer en español/i })).toHaveAttribute(
      "href",
      "/rules",
    );
  });
});
