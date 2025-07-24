import { useState, useCallback, useEffect, PropsWithChildren, useMemo } from "react";
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
export const CLIENT_ENVIRONMENT = import.meta.env.VITE_APP_ENVIRONMENT || "development";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);

const sendPing = (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  socket.emit(EClientEvent.PING, Date.now());
};

export const TrucoshiProvider = ({ children }: PropsWithChildren) => {
  // **State Variables**
  const [session, setSession] = useStateStorage<string | null>("session", null);
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [name, setName] = useStateStorage<string>("id", "Satoshi");
  const [account, setAccount] = useState<User | null>(null);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [isLoadingAccount, setLoadingAccount] = useState(true);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [serverAheadTime, setServerAheadTime] = useState<number>(0);
  const [cardTheme, setCardTheme] = useStateStorage<ICardTheme>("cardtheme", "default");
  const [cards, cardsReady] = useCards({ theme: cardTheme });
  const [inspectedCard, setInspectedCard] = useState<ICard | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);
  const [, , removeCookie] = useCookies(["jwt:identity"]);

  // **Hooks**
  const { me, error, isFetching: isPendingMe, refetch: refetchMe, reset } = useMe();
  const { isPending: isPendingRefreshTokens } = useRefreshTokens();
  const { logout: apiLogout } = useLogout();
  const { isPending: isPendingLogin } = useLogin();
  const { updateProfile, isPending: isPendingUpdateProfile } = useUpdateProfile();
  const toast = useToast();

  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>(() =>
    io(HOST, {
      withCredentials: true,
      autoConnect: false,
      secure: import.meta.env.MODE === "production",
      auth: {
        sessionID: session,
        name,
        identity: me ? getIdentityCookie() : undefined,
        user: error ? undefined : me,
      },
    })
  );

  useEffect(() => {
    setShouldConnect(!isPendingMe);
  }, [isPendingMe]);

  useEffect(() => {
    if (shouldConnect) {
      setSocket((current) => {
        if ((current.auth as any).me?.id === me?.id) {
          current.connect();
          return current;
        }

        const newSocket = io(HOST, {
          withCredentials: true,
          autoConnect: false,
          secure: import.meta.env.MODE === "production",
          auth: {
            sessionID: session,
            name,
            identity: me ? getIdentityCookie() : undefined,
            user: error ? undefined : me,
          },
        });
        newSocket.connect();
        return newSocket;
      });
    }
  }, [error, me, name, session, shouldConnect]);

  const logout = useCallback(() => {
    reset();
    setLoadingAccount(true);
    setShouldConnect(false);
    setSocket(() => {
      return io(HOST, {
        withCredentials: true,
        autoConnect: false,
        secure: import.meta.env.MODE === "production",
        auth: {
          sessionID: session,
          name,
        },
      });
    });
    apiLogout(
      { withCredentials: true },
      {
        onError(e) {
          toast.error(e.message);
        },
        onSettled() {
          refetchMe().finally(() => {
            socket.emit(EClientEvent.LOGOUT, ({ error: e }) => {
              if (e) {
                toast.error(e.message);
              }
              setTimeout(() => {
                setShouldConnect(true);
              });
            });
            setLogged(false);
            setAccount(null);
            setActiveMatches([]);
            removeCookie("jwt:identity");
          });
        },
      }
    );
  }, [reset, apiLogout, session, name, toast, refetchMe, socket, removeCookie]);

  useEffect(() => {
    let timer: NodeJS.Timer | null = null;

    socket.on("connect", () => {
      setConnected(true);
      sendPing(socket);
      timer && clearInterval(timer);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setLoadingAccount(true);

      timer = setInterval(() => {
        if (!socket.active) {
          socket.connect();
          timer && clearInterval(timer);
        }
      }, 5000);
    });

    socket.on(EServerEvent.SET_SESSION, ({ session, account }, serverVersion, newActiveMatches) => {
      if (!account) {
        setSession(session);
      }
      setAccount(account || null);
      setLogged(!!account);
      setActiveMatches(newActiveMatches);
      setVersion(`${CLIENT_VERSION}-${serverVersion}`);
      setLoadingAccount(false);
    });

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

    socket.on(EServerEvent.REFRESH_IDENTITY, async (userId, cb) => {
      if (!account || userId !== account.id) {
        return cb(null);
      }
      try {
        await refetchMe();
        const token = getIdentityCookie();
        cb(token || null);
      } catch (e) {
        cb(null);
      }
    });

    return () => {
      socket.off("connect");
      socket.off(EServerEvent.SET_SESSION);
      socket.off(EServerEvent.UPDATE_ACTIVE_MATCHES);
      socket.off(EServerEvent.MATCH_DELETED);
      socket.off(EServerEvent.PONG);
      socket.off(EServerEvent.REFRESH_IDENTITY);
      timer && clearInterval(timer);
    };
  }, [socket, setSession, account, refetchMe, removeCookie, toast, logout]);

  const sendUserId = useCallback(
    (name: string, callback?: (name: string) => void) => {
      if (account) {
        return updateProfile(
          { name },
          {
            onSuccess() {
              refetchMe()
                .then((res) => {
                  if (res.data?.data) {
                    setAccount(res.data.data);
                    callback?.(res.data.data.name);
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
      setName(name);
      callback?.(name);
    },
    [account, refetchMe, setName, toast, updateProfile]
  );

  const fetchPublicMatches = useCallback(
    (filters: { state?: Array<EMatchState> } = {}) => {
      socket.emit(EClientEvent.LIST_MATCHES, filters, ({ matches }) => {
        setPublicMatches(matches);
      });
    },
    [socket]
  );

  // **Error Handling**
  useEffect(() => {
    if (is401(error)) {
      logout();
    }
  }, [error, logout]);

  // **Context Value**
  return (
    <TrucoshiContext.Provider
      value={{
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
              isPendingMe,
              isPendingRefreshTokens,
              isLoadingAccount,
              isPendingLogin,
              isPendingUpdateProfile,
            ]
          ),
          cards,
        },
        dispatch: {
          setDark,
          setCardTheme,
          setSidebarOpen,
          sendPing: () => sendPing(socket),
          sendUserId,
          setActiveMatches,
          fetchPublicMatches,
          inspectCard: setInspectedCard,
          logout,
          refetchMe,
        },
      }}
    >
      {children}
    </TrucoshiContext.Provider>
  );
};
