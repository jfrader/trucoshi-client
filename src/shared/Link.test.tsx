import { createRef } from "react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "../test/renderWithTheme";
import { Link } from "./Link";

describe("Link", () => {
  it("forwards its anchor ref for MUI components", () => {
    const ref = createRef<HTMLAnchorElement>();

    renderWithTheme(
      <MemoryRouter>
        <Link ref={ref} to="/">
          Home
        </Link>
      </MemoryRouter>,
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});
