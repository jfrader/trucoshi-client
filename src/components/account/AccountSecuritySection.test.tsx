import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "lightning-accounts";
import type { ReactNode } from "react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { AccountSecuritySection } from "./AccountSecuritySection";

const mocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  setSeed: vi.fn(),
  toastSuccess: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));

vi.mock("../../api/hooks/useSetSeed", () => ({
  useSetSeed: () => ({ setSeed: mocks.setSeed, isPending: false }),
}));

vi.mock("../../api/hooks/useUpdateProfile", () => ({
  useUpdateProfile: () => ({ updateProfile: mocks.updateProfile, isPending: false }),
}));

vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({ success: mocks.toastSuccess }),
}));

vi.mock("../../shared/TwitterButton", () => ({
  TwitterButton: ({ children }: { children?: ReactNode }) => (
    <button type="button">{children || "Conectar"}</button>
  ),
}));

const buildAccount = (overrides: Partial<User> = {}): User => ({
  id: 7,
  name: "Satoshi",
  updatedAt: "2026-07-14T00:00:00.000Z",
  email: null,
  hasPassword: false,
  hasSeed: false,
  twitter: null,
  ...overrides,
});

const renderSecurity = (overrides: Partial<User> = {}) =>
  renderWithTheme(<AccountSecuritySection account={buildAccount(overrides)} />);

const getSettingButton = (testId: string, name: RegExp) =>
  within(screen.getByTestId(testId)).getByRole("button", { name });

describe("AccountSecuritySection", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });

  it("preserves first-email setup with a new password", async () => {
    renderSecurity();

    userEvent.click(getSettingButton("account-email-setting", /Agregar/i));
    userEvent.type(await screen.findByLabelText("Email"), "first@example.com");
    userEvent.type(screen.getByLabelText("Nueva contraseña"), "new-password");
    userEvent.type(screen.getByLabelText("Repetir contraseña"), "new-password");
    userEvent.click(screen.getByRole("button", { name: "Guardar email" }));

    expect(mocks.updateProfile).toHaveBeenCalledWith(
      {
        email: "first@example.com",
        password: "new-password",
        currentPassword: undefined,
      },
      expect.any(Object),
    );
  });

  it("requires the current password when changing an existing email", async () => {
    renderSecurity({ email: "old@example.com", hasPassword: true });

    userEvent.click(getSettingButton("account-email-setting", /Cambiar/i));
    const emailInput = await screen.findByLabelText("Nuevo email");
    userEvent.clear(emailInput);
    userEvent.type(emailInput, "new@example.com");
    userEvent.type(screen.getByLabelText("Contraseña actual"), "current secret");
    userEvent.click(screen.getByRole("button", { name: "Guardar email" }));

    expect(mocks.updateProfile.mock.calls[0][0]).toEqual({
      email: "new@example.com",
      password: undefined,
      currentPassword: "current secret",
    });
  });

  it("validates password changes before calling the API", async () => {
    renderSecurity({ email: "player@example.com", hasPassword: false });

    userEvent.click(getSettingButton("account-password-setting", /Agregar/i));
    userEvent.type(await screen.findByLabelText("Nueva contraseña"), "short");
    userEvent.type(screen.getByLabelText("Repetir contraseña"), "short");
    fireEvent.submit(document.getElementById("account-password-form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La contraseña debe tener al menos 8 caracteres",
    );
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it("keeps a regenerated seed visible until it is confirmed saved", async () => {
    mocks.setSeed.mockImplementation((_variables, options) => {
      options.onSuccess({ seedPhrase: "mate ceibo naipe luna patio" });
    });
    renderSecurity({ email: "player@example.com", hasSeed: true });

    userEvent.click(getSettingButton("account-seed-setting", /Regenerar/i));
    userEvent.click(screen.getByRole("button", { name: "Regenerar" }));

    expect(await screen.findByTestId("account-seed-phrase")).toHaveTextContent(
      "mate ceibo naipe luna patio",
    );
    userEvent.click(screen.getByRole("button", { name: "Ya la guardé" }));
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["me"] });
  });
});
