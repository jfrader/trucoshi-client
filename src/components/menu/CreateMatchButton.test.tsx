import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { CreateMatchButton } from "./CreateMatchButton";

const createMatch = vi.fn();
const navigate = vi.fn();

let canStartNewGames = true;

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

vi.mock("../../trucoshi/hooks/useMatch", () => ({
  useMatch: () => [{}, { createMatch }],
}));

vi.mock("../../trucoshi/hooks/useGameAdmission", () => ({
  useGameAdmission: () => ({ canStartNewGames }),
}));

describe("CreateMatchButton admission gate", () => {
  beforeEach(() => {
    canStartNewGames = true;
    createMatch.mockClear();
    navigate.mockClear();
  });

  it("creates and opens a lobby while admission is accepting", () => {
    createMatch.mockImplementation((callback) => callback(null, { matchSessionId: "new-match" }));
    renderWithTheme(<CreateMatchButton />);

    fireEvent.click(screen.getByRole("button", { name: /crear partida/i }));

    expect(createMatch).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/lobby/new-match");
  });

  it("does not create a match while admission is draining", () => {
    canStartNewGames = false;
    renderWithTheme(<CreateMatchButton />);

    const button = screen.getByRole("button", { name: /partidas en pausa/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);

    expect(createMatch).not.toHaveBeenCalled();
  });
});
