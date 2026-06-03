import { screen } from "@testing-library/react";
import { IChatMessage } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildPlayer } from "../../test/fixtures/gameFixtures";
import { SeatAvatarBadges } from "./SeatAvatarBadges";

describe("SeatAvatarBadges", () => {
  it("renders the mate badge for the player that sent a mate say", () => {
    const player = buildPlayer({ key: "p1", teamIdx: 0 });
    const say = {
      user: { key: player.key, name: player.name },
      sound: "mate",
    } as IChatMessage;

    renderWithTheme(<SeatAvatarBadges player={player} say={say} />);

    expect(screen.getByLabelText("Toma mate")).toBeInTheDocument();
  });

  it("renders mano and host role badges", () => {
    const player = buildPlayer({ key: "p1", teamIdx: 0, isOwner: true });

    const { rerender } = renderWithTheme(<SeatAvatarBadges player={player} showForehand />);

    expect(screen.getByLabelText("Mano")).toBeInTheDocument();

    rerender(<SeatAvatarBadges player={player} showHost />);

    expect(screen.getByLabelText("Host")).toBeInTheDocument();
  });
});
