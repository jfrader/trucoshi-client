const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PLAYER_NAME_MAX_LENGTH = 16;

export const validatePlayerName = (name: string) => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return "El nombre es requerido";
  }
  if (normalizedName.length > PLAYER_NAME_MAX_LENGTH) {
    return `El nombre puede tener hasta ${PLAYER_NAME_MAX_LENGTH} caracteres`;
  }
  return "";
};

export const validateEmail = (email: string) => {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "El email es requerido";
  }
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return "Ingresa un email valido";
  }
  return "";
};

export const validatePasswordPair = (password: string, confirmation: string) => {
  if (!password || !confirmation) {
    return "Completa ambas contraseñas";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  if (password !== confirmation) {
    return "Las contraseñas no coinciden";
  }
  return "";
};

export const getAccountErrorMessage = (
  error: unknown,
  fallback = "No pudimos guardar el cambio. Intenta de nuevo.",
) => {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;

  if (typeof responseMessage === "string" && responseMessage) {
    return responseMessage;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};
