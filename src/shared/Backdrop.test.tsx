import { screen } from "@testing-library/react";
import { renderWithTheme } from "../test/renderWithTheme";
import { Backdrop } from "./Backdrop";

const APP_VIEWPORT_HEIGHT = "var(--trucoshi-viewport-height, 100dvh)";

describe("Backdrop viewport behavior", () => {
  it("portals to the body and fills the visual viewport", () => {
    renderWithTheme(
      <Backdrop data-testid="test-backdrop" hideLogo open>
        <div>Overlay content</div>
      </Backdrop>,
    );

    const backdrop = screen.getByTestId("test-backdrop");
    const viewport = screen.getByTestId("backdrop-viewport");

    expect(backdrop.parentElement).toBe(document.body);
    expect(backdrop).toHaveAttribute("data-trucoshi-overlay", "open");
    expect(backdrop).toHaveStyle({ height: APP_VIEWPORT_HEIGHT, position: "fixed" });
    expect(viewport).toHaveStyle({ height: "100%", overflow: "auto" });
  });
});
