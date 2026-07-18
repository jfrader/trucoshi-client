import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CLOSED_GAME_ADMISSION,
  canStartNewGame,
  isAdmissionDrainError,
  parseGameAdmission,
  type GameAdmissionStatus,
} from "../admission";

export const GAME_ADMISSION_QUERY_KEY = ["game-admission"] as const;

export const readGameAdmission = async (): Promise<GameAdmissionStatus> => {
  try {
    const response = await fetch("/admission.json", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { ...CLOSED_GAME_ADMISSION };
    }

    return parseGameAdmission(await response.json());
  } catch {
    return { ...CLOSED_GAME_ADMISSION };
  }
};

export const useGameAdmission = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: GAME_ADMISSION_QUERY_KEY,
    queryFn: readGameAdmission,
    placeholderData: CLOSED_GAME_ADMISSION,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 2_000,
  });
  const status = query.data || CLOSED_GAME_ADMISSION;
  const canStartNewGames = canStartNewGame(status);

  const markAdmissionDraining = () => {
    queryClient.setQueryData<GameAdmissionStatus>(GAME_ADMISSION_QUERY_KEY, {
      admission: "draining",
      acceptingNewGames: false,
      available: status.available,
      version: status.version,
    });
  };

  const reportAdmissionError = (error: unknown) => {
    if (!isAdmissionDrainError(error)) {
      return false;
    }

    markAdmissionDraining();
    return true;
  };

  const retryAdmission = () => query.refetch();

  return {
    ...status,
    canStartNewGames,
    isChecking: query.isFetching,
    isDraining: !canStartNewGames,
    markAdmissionDraining,
    reportAdmissionError,
    retryAdmission,
  };
};
