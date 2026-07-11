import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import {
  CHEST_SPRITE_BACKGROUND_SIZE,
  ChestFrame,
  getChestFramePosition,
} from "./TreasureChestSprite";

describe("ChestFrame", () => {
  it("crops the new double-height sprite sheet to a square frame", () => {
    renderWithTheme(<ChestFrame frame={0} />);

    expect(screen.getByTestId("treasure-chest-sprite")).toHaveAttribute("data-frame", "0");
    expect(CHEST_SPRITE_BACKGROUND_SIZE).toBe("800% 200%");
    expect(getChestFramePosition(0)).toBe("0% 52.5%");
  });

  it("selects and clamps frames across the eight-column sheet", () => {
    expect(getChestFramePosition(7)).toBe("100% 52.5%");
    expect(getChestFramePosition(20)).toBe("100% 52.5%");
    expect(getChestFramePosition(-1)).toBe("0% 52.5%");
  });
});
