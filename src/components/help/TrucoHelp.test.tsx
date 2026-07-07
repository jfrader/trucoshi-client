import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "../../test/renderWithTheme";
import { TrucoHelp } from "./TrucoHelp";

const createTutorialMatch = vi.fn();
const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../../trucoshi/hooks/useMatch", () => ({
  useMatch: () => [{}, { createTutorialMatch }],
}));

vi.mock("./CardRanking", () => ({
  CardRanking: () => <div data-testid="card-ranking" />,
}));

const renderTrucoHelp = () =>
  renderWithTheme(
    <MemoryRouter>
      <TrucoHelp />
    </MemoryRouter>,
  );

describe("TrucoHelp", () => {
  beforeEach(() => {
    createTutorialMatch.mockReset();
    navigate.mockReset();
    createTutorialMatch.mockImplementation((callback: any) =>
      callback(null, { matchSessionId: "tutorial-session" }),
    );
  });

  it("renders internal Spanish and English rule links instead of Fournier links", () => {
    renderTrucoHelp();

    expect(screen.getByRole("link", { name: /como jugar truco/i })).toHaveAttribute(
      "href",
      "/help/rules/es",
    );
    expect(screen.getByRole("link", { name: /how to play truco/i })).toHaveAttribute(
      "href",
      "/help/rules/en",
    );
    expect(screen.queryByText(/nhfournier/i)).not.toBeInTheDocument();
  });

  it("keeps the card ranking on the help page", () => {
    renderTrucoHelp();

    expect(screen.getByTestId("card-ranking")).toBeInTheDocument();
  });

  it("starts the tutorial from the help page", () => {
    renderTrucoHelp();

    fireEvent.click(screen.getByRole("button", { name: /jugar tutorial/i }));

    expect(createTutorialMatch).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/match/tutorial-session");
  });
});
