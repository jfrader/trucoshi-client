import { useContext, useEffect, useState } from "react";
import { EClientEvent, type IAccountDetails } from "trucoshi";
import { TrucoshiContext } from "../../trucoshi/trucoshi.context";

const PROFILE_REQUEST_TIMEOUT_MS = 8_000;

type PlayerProfileState = {
  profile: IAccountDetails | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

type PlayerProfileRequest = Omit<PlayerProfileState, "retry"> & {
  accountId?: number;
};

export const usePlayerProfile = (accountId?: number): PlayerProfileState => {
  const context = useContext(TrucoshiContext);
  const [request, setRequest] = useState<PlayerProfileRequest>({
    accountId,
    profile: null,
    isLoading: Boolean(accountId),
    error: null,
  });
  const [requestVersion, setRequestVersion] = useState(0);

  if (!context) {
    throw new Error("usePlayerProfile must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    if (!accountId) {
      setRequest({ accountId: undefined, profile: null, isLoading: false, error: null });
      return;
    }

    let isActive = true;

    setRequest({ accountId, profile: null, isLoading: true, error: null });

    const timeout = setTimeout(() => {
      if (!isActive) {
        return;
      }

      setRequest({
        accountId,
        profile: null,
        isLoading: false,
        error: context.state.isConnected
          ? "El perfil está tardando más de lo esperado. Intentá nuevamente."
          : "No pudimos conectarnos al juego. Revisá tu conexión e intentá nuevamente.",
      });
    }, PROFILE_REQUEST_TIMEOUT_MS);

    if (!context.state.isConnected) {
      return () => {
        isActive = false;
        clearTimeout(timeout);
      };
    }

    context.socket.emit(
      EClientEvent.FETCH_ACCOUNT_DETAILS,
      accountId,
      ({ account, matches, stats, error: responseError, success }) => {
        if (!isActive) {
          return;
        }

        clearTimeout(timeout);

        if (responseError) {
          setRequest({
            accountId,
            profile: null,
            isLoading: false,
            error: responseError.message || "No se pudo cargar el perfil",
          });
          return;
        }

        if (success) {
          setRequest({
            accountId,
            profile: { account, matches, stats },
            isLoading: false,
            error: null,
          });
          return;
        }

        setRequest({
          accountId,
          profile: null,
          isLoading: false,
          error: "No se pudo cargar el perfil",
        });
      },
    );

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [accountId, context.socket, context.state.isConnected, requestVersion]);

  const retry = () => setRequestVersion((version) => version + 1);
  const isCurrentRequest = request.accountId === accountId;

  return {
    profile: isCurrentRequest ? request.profile : null,
    isLoading: Boolean(accountId) && (!isCurrentRequest || request.isLoading),
    error: isCurrentRequest ? request.error : null,
    retry,
  };
};
