import { fireEvent, screen } from "@testing-library/react";
import { EMatchState, type IPublicMatchInfo } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { PublicMatchesList } from "./PublicMatchesList";

const navigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

const match = (overrides: Partial<IPublicMatchInfo> = {}): IPublicMatchInfo => ({
  ownerId: "Ana",
  matchSessionId: "mesa-123",
  players: 1,
  options: {
    maxPlayers: 2,
    faltaEnvido: 1,
    flor: true,
    matchPoint: 9,
    handAckTime: 10,
    turnTime: 30,
    abandonTime: 30,
    satsPerPlayer: 0,
  },
  state: EMatchState.UNREADY,
  winnerTeamIdx: undefined,
  createdFromQueue: false,
  ...overrides,
});

describe("PublicMatchesList", () => {
  it("shows a purposeful empty state", () => {
    renderWithTheme(<PublicMatchesList matches={[]} />);

    expect(screen.getByText("No hay mesas públicas")).toBeInTheDocument();
  });

  it("opens lobbies and started matches on their matching routes", () => {
    renderWithTheme(
      <PublicMatchesList
        matches={[
          match(),
          match({
            matchSessionId: "ranked-456",
            state: EMatchState.STARTED,
            createdFromQueue: true,
            players: 2,
          }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /mesa de ana/i }));
    fireEvent.click(screen.getByRole("button", { name: /partida rankeada/i }));

    expect(navigate).toHaveBeenNthCalledWith(1, "/lobby/mesa-123");
    expect(navigate).toHaveBeenNthCalledWith(2, "/match/ranked-456");
  });
});
