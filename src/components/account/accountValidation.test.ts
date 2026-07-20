import {
  getAccountErrorMessage,
  validateEmail,
  validatePasswordPair,
  validatePlayerName,
} from "./accountValidation";

describe("account validation", () => {
  it("validates player names and email addresses", () => {
    expect(validatePlayerName("   ")).toBe("El nombre es requerido");
    expect(validatePlayerName("12345678901234567")).toBe(
      "El nombre puede tener hasta 16 caracteres",
    );
    expect(validatePlayerName("  Satoshi  ")).toBe("");
    expect(validateEmail("satoshi@localhost")).toBe("Ingresa un email valido");
    expect(validateEmail("  satoshi@example.com  ")).toBe("");
  });

  it("reports missing, short, and mismatched passwords", () => {
    expect(validatePasswordPair("", "")).toBe("Completa ambas contraseñas");
    expect(validatePasswordPair("short", "short")).toBe(
      "La contraseña debe tener al menos 8 caracteres",
    );
    expect(validatePasswordPair("password-one", "password-two")).toBe(
      "Las contraseñas no coinciden",
    );
    expect(validatePasswordPair("  secret  ", "  secret  ")).toBe("");
  });

  it("prefers API error messages and falls back safely", () => {
    expect(
      getAccountErrorMessage({ response: { data: { message: "Password doesn't match" } } }),
    ).toBe("Password doesn't match");
    expect(getAccountErrorMessage(new Error("Network Error"))).toBe("Network Error");
    expect(getAccountErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
