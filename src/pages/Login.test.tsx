import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "../test/renderWithTheme";
import { Login } from "./Login";
import { PENDING_REWARD_CODE_KEY } from "../components/reward/rewardCodeStorage";

const mocks = vi.hoisted(() => ({
  state: {
    account: null as any,
  },
  login: vi.fn(),
  sendMagicLink: vi.fn(),
  seedLogin: vi.fn(),
  resetQueries: vi.fn(),
}));

vi.mock("../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state],
}));

vi.mock("../api/hooks/useLogin", () => ({
  useLogin: () => ({
    login: mocks.login,
    isPending: false,
  }),
}));

vi.mock("../api/hooks/useMagicLinkLogin", () => ({
  useMagicLinkLogin: () => ({
    sendMagicLink: mocks.sendMagicLink,
    isPending: false,
  }),
}));

vi.mock("../api/hooks/useSeedLogin", () => ({
  useSeedLogin: () => ({
    seedLogin: mocks.seedLogin,
    isPending: false,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    resetQueries: mocks.resetQueries,
  }),
}));

const renderLogin = () =>
  renderWithTheme(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe("Login", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) || null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    window.localStorage.clear();
    mocks.state.account = null;
    mocks.login.mockReset();
    mocks.sendMagicLink.mockReset();
    mocks.seedLogin.mockReset();
    mocks.resetQueries.mockReset();
  });

  it("shows the treasure promo alert when a reward code is pending", () => {
    window.localStorage.setItem(PENDING_REWARD_CODE_KEY, "ABC123");

    renderLogin();

    expect(
      screen.getByText("Ingresa tu email y entra al link para registrarte")
    ).toBeInTheDocument();
  });

  it("hides the treasure promo alert without a pending reward code", () => {
    renderLogin();

    expect(
      screen.queryByText("Ingresa tu email y entra al link para registrarte")
    ).not.toBeInTheDocument();
  });

  it("uses email magic link login by default", () => {
    renderLogin();

    expect(screen.getByRole("button", { name: /^email$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^frase de semilla$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^contraseña$/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar link de ingreso/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
  });

  it("sends magic link login from the default form and explains first-time users are registered", () => {
    mocks.sendMagicLink.mockImplementation((_payload, options) => options.onSuccess());
    renderLogin();

    userEvent.type(screen.getByLabelText("Email"), "new@example.com");
    userEvent.click(screen.getByRole("button", { name: /enviar link de ingreso/i }));

    expect(mocks.sendMagicLink).toHaveBeenCalledWith(
      { email: "new@example.com" },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    );
    expect(screen.getByText(/si es tu primera vez, vamos a crear tu cuenta/i)).toBeInTheDocument();
  });

  it("allows password login inside the email tab", () => {
    renderLogin();

    userEvent.click(screen.getByRole("button", { name: /usar contraseña/i }));

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /usar link de ingreso/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /olvidaste tu contraseña/i })).toBeInTheDocument();
  });

  it("shows seed login as the second top-level tab", () => {
    renderLogin();

    userEvent.click(screen.getByRole("button", { name: /^frase de semilla$/i }));

    expect(screen.getByLabelText("Frase de Semilla")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /usar contraseña/i })).not.toBeInTheDocument();
  });
});
