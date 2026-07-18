import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { renderWithTheme } from "../../test/renderWithTheme";
import { MainLayout } from "./MainLayout";

vi.mock("../../shared/SocketBackdrop", () => ({ SocketBackdrop: () => null }));
vi.mock("../card/CardToggler", () => ({ CardToggler: () => null }));
vi.mock("./Footer", () => ({ Footer: () => null }));

describe("MainLayout", () => {
  it("keeps the desktop wordmark at a bounded height", () => {
    renderWithTheme(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    expect(screen.getByText("Trucoshi")).toHaveStyle({ minHeight: "120px" });
  });
});
