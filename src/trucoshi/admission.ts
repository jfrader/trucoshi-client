export const ADMISSION_DRAIN_ERROR_CODE = "FORBIDDEN";
export const ADMISSION_DRAIN_ERROR_MESSAGE =
  "El servidor esta en mantenimiento y no acepta partidas nuevas";

export const ADMISSION_MAINTENANCE_MESSAGE = "Nuevas partidas en pausa";
export const ADMISSION_MAINTENANCE_DETAIL =
  "Las partidas en curso siguen funcionando, pero por el momento no se pueden crear, iniciar ni buscar partidas nuevas.";

export type GameAdmissionStatus = {
  admission: "accepting" | "draining";
  acceptingNewGames: boolean;
  available: boolean;
  version: string | null;
};

export const CLOSED_GAME_ADMISSION: GameAdmissionStatus = {
  admission: "draining",
  acceptingNewGames: false,
  available: false,
  version: null,
};

type UnknownRecord = Record<string, unknown>;

export type AdmissionError = {
  code: string;
  message: string;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseGameAdmission = (value: unknown): GameAdmissionStatus => {
  if (!isRecord(value)) {
    return { ...CLOSED_GAME_ADMISSION };
  }

  const validAdmission = value.admission === "accepting" || value.admission === "draining";
  const validVersion = typeof value.version === "string" || value.version === null;
  const consistent = value.acceptingNewGames === (value.admission === "accepting");
  const validAvailability =
    value.available === true
      ? typeof value.version === "string" && Boolean(value.version.trim())
      : value.available === false &&
        value.admission === "draining" &&
        value.acceptingNewGames === false &&
        value.version === null;

  if (
    !validAdmission ||
    typeof value.acceptingNewGames !== "boolean" ||
    typeof value.available !== "boolean" ||
    !validVersion ||
    !consistent ||
    !validAvailability
  ) {
    return { ...CLOSED_GAME_ADMISSION };
  }

  return {
    admission: value.admission as GameAdmissionStatus["admission"],
    acceptingNewGames: value.acceptingNewGames,
    available: value.available,
    version: typeof value.version === "string" ? value.version.trim().slice(0, 200) : null,
  };
};

export const canStartNewGame = (status: GameAdmissionStatus) =>
  status.available && status.admission === "accepting" && status.acceptingNewGames;

const getDirectError = (value: UnknownRecord): AdmissionError | null => {
  const data = isRecord(value.data) ? value.data : null;
  const code =
    typeof value.code === "string"
      ? value.code
      : data && typeof data.code === "string"
        ? data.code
        : null;
  const message = typeof value.message === "string" ? value.message : null;

  return code && message ? { code, message } : null;
};

export const getAdmissionError = (value: unknown): AdmissionError | null => {
  const seen = new Set<object>();

  const visit = (candidate: unknown, depth: number): AdmissionError | null => {
    if (!isRecord(candidate) || seen.has(candidate) || depth > 6) {
      return null;
    }
    seen.add(candidate);

    const response = isRecord(candidate.response) ? candidate.response : null;
    for (const explicitPayload of [candidate.error, response?.data]) {
      const nestedError = visit(explicitPayload, depth + 1);
      if (nestedError) {
        return nestedError;
      }
    }

    const directError = getDirectError(candidate);
    if (directError) {
      return directError;
    }

    for (const nested of [candidate.data, candidate.response, candidate.cause]) {
      const nestedError = visit(nested, depth + 1);
      if (nestedError) {
        return nestedError;
      }
    }

    return null;
  };

  return visit(value, 0);
};

export const isAdmissionDrainError = (value: unknown): boolean => {
  const error = getAdmissionError(value);

  return (
    error?.code === ADMISSION_DRAIN_ERROR_CODE && error.message === ADMISSION_DRAIN_ERROR_MESSAGE
  );
};
