import { useState, useCallback, useEffect, PropsWithChildren, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  EClientEvent,
  EServerEvent,
  ICard,
  IPublicMatchInfo,
  ServerToClientEvents,
  EMatchState,
} from "trucoshi";
import useStateStorage from "../hooks/useStateStorage";
import { createContext } from "react";
import { ICardTheme, ITrucoshiContext } from "./types";
import { useCards } from "./hooks/useCards";
import { useMe } from "../api/hooks/useMe";
import { useCookies } from "react-cookie";
import { User } from "lightning-accounts";
import { useLogout } from "../api/hooks/useLogout";
import { useRefreshTokens } from "../api/hooks/useRefreshTokens";
import { is401 } from "../api/apiClient";
import { useLogin } from "../api/hooks/useLogin";
import { useToast } from "../hooks/useToast";
import { useUpdateProfile } from "../api/hooks/useUpdateProfile";
import { getIdentityCookie } from "../utils/cookie";

const HOST = import.meta.env.VITE_APP_HOST || "http://localhost:4001";
const CLIENT_VERSION = import.meta.env.VITE_APP_VERSION || "";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(HOST, {
  withCredentials: true,
  autoConnect: false,
  secure: import.meta.env.MODE === "production",
});

const sendPing = () => {
  socket.emit(EClientEvent.PING, Date.now());
};

export const TrucoshiProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useStateStorage("session");
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [, , removeCookie] = useCookies(["jwt:identity"]);

  const [version, setVersion] = useState("");
  const [name, setName] = useStateStorage("id", "Satoshi" as string);
  const [account, setAccount] = useState<User | null>(null);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [isLoadingAccount, setLoadingAccount] = useState(true);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [serverAheadTime, setServerAheadTime] = useState<number>(0);
  const [cardTheme, setCardTheme] = useStateStorage<ICardTheme>("cardtheme", "gnu");
  const [cards, cardsReady] = useCards({ theme: cardTheme });
  const [inspectedCard, inspectCard] = useState<ICard | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const { me, error, isFetching: isPendingMe, refetch: refetchMe } = useMe();
  const { isPending: isPendingRefreshTokens, refreshTokens } = useRefreshTokens();
  const { logout: apiLogout } = useLogout();
  const { isPending: isPendingLogin } = useLogin();
  const { updateProfile, isPending: isPendingUpdateProfile } = useUpdateProfile();

  const refreshIdentityPromise = useRef<Promise<unknown> | null>(null);

  const toast = useToast();

  const logout = useCallback(() => {
    setLoadingAccount(true);

    apiLogout(
      { withCredentials: true },
      {
        onError(e) {
          toast.error(e.message);
        },
        onSettled() {
          setLogged(false);
          setAccount(null);
          removeCookie("jwt:identity");
          refetchMe().then(() => {
            socket.emit(EClientEvent.LOGOUT, ({ error: e }) => {
              if (e) {
                toast.error(e.message);
              }

              setLoadingAccount(false);
              socket.disconnect();
            });
          });
        },
      }
    );
  }, [apiLogout, refetchMe, removeCookie, toast]);

  useEffect(() => {
    if (is401(error)) {
      logout();
    }
  }, [error, logout]);

  useEffect(() => {
    const identity = getIdentityCookie();
    if (!identity && !isPendingMe) {
      return setLoadingAccount(false);
    }
    if (me && identity) {
      if (isLogged) {
        setAccount(me);
        setLoadingAccount(false);
      } else {
        setLoadingAccount(true);
        socket.emit(EClientEvent.LOGIN, me, identity, ({ success, activeMatches, error }) => {
          if (error) {
            console.error(error.message);
          }
          if (activeMatches) {
            setActiveMatches(activeMatches);
          }
          if (success) {
            setLogged(true);
            setAccount(me);
            setLoadingAccount(false);
            return;
          }
          setAccount(null);
          setLogged(false);
          setLoadingAccount(false);
          refetchMe();
        });
      }
    }
  }, [isLogged, isPendingMe, me, refetchMe]);

  useEffect(() => {
    if (!socket.connected) {
      if (session) {
        socket.auth = { sessionID: session, name };
      }
      socket.connect();
    }

    socket.on("connect", () => {
      sendPing();
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      socket.connect();
    });

    socket.on(EServerEvent.REFRESH_IDENTITY, async (userId, cb) => {
      if (!account || userId !== account.id) {
        return cb(null);
      }

      refreshIdentityPromise.current = new Promise<void>((resolve) => {
        refreshTokens(
          { withCredentials: true },
          {
            onSettled() {
              cb(getIdentityCookie() || null);
              resolve();
            },
            onError() {
              cb(null);
            },
          }
        );
      });
    });

    socket.on(
      EServerEvent.SET_SESSION,
      ({ session, account }, serverVersion, newActiveMatches): void => {
        setActiveMatches(newActiveMatches);
        setVersion(CLIENT_VERSION + "-" + serverVersion);
        if (!account) {
          setSession(session);
        }
      }
    );

    socket.on(EServerEvent.UPDATE_ACTIVE_MATCHES, (newActiveMatches) => {
      setActiveMatches(newActiveMatches);
    });

    socket.on(EServerEvent.MATCH_DELETED, (deletedMatchSessionId) => {
      setActiveMatches((current) =>
        current.filter((m) => m.matchSessionId !== deletedMatchSessionId)
      );
    });

    socket.on(EServerEvent.PONG, (serverTime, clientTime) => {
      setLastPong(serverTime);
      setServerAheadTime(serverTime - clientTime);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(EServerEvent.MATCH_DELETED);
      socket.off(EServerEvent.SET_SESSION);
      socket.off(EServerEvent.UPDATE_ACTIVE_MATCHES);
      socket.off(EServerEvent.REFRESH_IDENTITY);
      socket.off(EServerEvent.PONG);
    };
  }, [account, account?.name, name, refreshTokens, session, setName, setSession]);

  const sendUserId = useCallback(
    (name: string, callback?: (name: string) => void) => {
      if (account) {
        return updateProfile(
          { name },
          {
            onSuccess() {
              refetchMe()
                .then((res) => {
                  if (res.data) {
                    setAccount(res.data.data);
                    callback?.(res.data.data.name);
                    socket.disconnect();
                  }
                })
                .catch((e) => {
                  toast.error(e.message);
                  callback?.(name);
                });
            },
            onError(e) {
              toast.error(e.message);
              callback?.(name);
            },
          }
        );
      }

      socket.disconnect();
      setName(name);
      callback?.(name);
    },
    [account, refetchMe, setName, toast, updateProfile]
  );

  const fetchPublicMatches = useCallback((filters: { state?: Array<EMatchState> } = {}) => {
    socket.emit(EClientEvent.LIST_MATCHES, filters, ({ matches }) => {
      setPublicMatches(matches);
    });
  }, []);

  return (
    <TrucoshiContext.Provider
      value={
        {
          socket,
          state: {
            dark,
            account,
            version,
            publicMatches,
            session,
            name,
            isConnected,
            isLogged,
            lastPong,
            activeMatches,
            serverAheadTime,
            cardTheme,
            cardsReady,
            isSidebarOpen,
            inspectedCard,
            isLoggingIn: isLoadingAccount,
            isAccountPending: useMemo(
              () =>
                isPendingMe ||
                isPendingRefreshTokens ||
                isLoadingAccount ||
                isPendingLogin ||
                isPendingUpdateProfile,
              [
                isLoadingAccount,
                isPendingLogin,
                isPendingMe,
                isPendingRefreshTokens,
                isPendingUpdateProfile,
              ]
            ),
            cards,
          },
          dispatch: {
            setDark,
            setCardTheme,
            setSidebarOpen,
            sendPing,
            sendUserId,
            setActiveMatches,
            fetchPublicMatches,
            inspectCard,
            logout,
            refetchMe,
          },
        } satisfies ITrucoshiContext
      }
    >
      {children}
    </TrucoshiContext.Provider>
  );
};
