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
}));

vi.mock("../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state],
}));

vi.mock("../api/hooks/useLogin", () => ({
  useLogin: () => ({
    login: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("../api/hooks/useMagicLinkLogin", () => ({
  useMagicLinkLogin: () => ({
    sendMagicLink: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("../api/hooks/useSeedLogin", () => ({
  useSeedLogin: () => ({
    seedLogin: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    resetQueries: vi.fn(),
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
  });

  it("shows the treasure promo alert when a reward code is pending", () => {
    window.localStorage.setItem(PENDING_REWARD_CODE_KEY, "ABC123");

    renderLogin();

    expect(
      screen.getByText("Recibiste un cofre! Inicia sesion para reclamarlo o registrate!")
    ).toBeInTheDocument();
  });

  it("hides the treasure promo alert without a pending reward code", () => {
    renderLogin();

    expect(
      screen.queryByText("Recibiste un cofre! Inicia sesion para reclamarlo o registrate!")
    ).not.toBeInTheDocument();
  });

  it("uses email magic link login by default", () => {
    renderLogin();

    expect(screen.getByRole("button", { name: /^email$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^frase de semilla$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^contraseña$/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar link de ingreso/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
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
