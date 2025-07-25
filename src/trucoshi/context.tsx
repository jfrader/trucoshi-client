import {
  useState,
  useCallback,
  useEffect,
  PropsWithChildren,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  EClientEvent,
  EServerEvent,
  ICard,
  IPublicMatchInfo,
  ServerToClientEvents,
  EMatchState,
  ITrucoshiStats,
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
import { useQueryClient } from "@tanstack/react-query";

const HOST = import.meta.env.VITE_APP_HOST || "http://localhost:4001";
const CLIENT_VERSION = import.meta.env.VITE_APP_VERSION || "";
export const CLIENT_ENVIRONMENT = import.meta.env.VITE_APP_ENVIRONMENT || "development";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);

const sendPing = (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  socket.emit(EClientEvent.PING, Date.now());
};

export const TrucoshiProvider = ({ children }: PropsWithChildren) => {
  // **State Variables**
  const [loggingOut, setLoggingOut] = useState(false);
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
  const [stats, setStats] = useState<ITrucoshiStats>({ onlinePlayers: [] });
  const [, , removeCookie] = useCookies(["jwt:identity"]);

  // **Hooks**
  const { me, error, isFetching: isPendingMe, refetch: refetchMe } = useMe();
  const { isPending: isPendingRefreshTokens } = useRefreshTokens();
  const { logout: apiLogout } = useLogout();
  const { isPending: isPendingLogin } = useLogin();
  const { updateProfile, isPending: isPendingUpdateProfile } = useUpdateProfile();
  const toast = useToast();
  const queryClient = useQueryClient();
  const timer = useRef<NodeJS.Timer | null>(null);

  const getAuth = useCallback(
    (cb: any) => {
      cb({
        sessionID: session,
        name,
        identity: me && !error ? getIdentityCookie() : undefined,
        user: error ? undefined : me,
      });
    },
    [error, me, name, session]
  );

  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>(() =>
    io(HOST, {
      withCredentials: true,
      autoConnect: false,
      secure: import.meta.env.MODE === "production",
      auth: getAuth,
    })
  );

  useEffect(() => {
    setShouldConnect(!isPendingMe && !loggingOut);
  }, [isPendingMe, loggingOut]);

  useLayoutEffect(() => {
    if (shouldConnect) {
      timer.current && clearInterval(timer.current);
      setSocket((current) => {
        if (
          current.active &&
          (current.auth as any).user?.id === me?.id &&
          current.auth.name === name
        ) {
          if (!current.connected) {
            current.connect();
          }
          return current;
        }

        current.io.reconnection(false);
        current.disconnect();

        const newSocket = io(HOST, {
          withCredentials: true,
          autoConnect: false,
          secure: import.meta.env.MODE === "production",
          auth: getAuth,
        });
        newSocket.connect();
        return newSocket;
      });
    }
  }, [getAuth, me?.id, name, shouldConnect]);

  const logout = useCallback(() => {
    setLoggingOut(true);
    setLoadingAccount(true);
    setShouldConnect(false);
    socket.io.reconnection(false);
    socket.emit(EClientEvent.LOGOUT, () => {});
    apiLogout(
      { withCredentials: true },
      {
        onError(e) {
          toast.error(e.message);
        },
        onSettled() {
          queryClient.setQueryData(["me"], () => ({ data: null }));
          removeCookie("jwt:identity");
          setLogged(false);
          setAccount(null);
          setActiveMatches([]);
          setTimeout(() => {
            setLoggingOut(false);
            setShouldConnect(true);
          }, 1000);
        },
      }
    );
  }, [socket, apiLogout, toast, queryClient, removeCookie]);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      sendPing(socket);
      socket.emit(EClientEvent.JOIN_ROOM, "stats");
      timer.current && clearInterval(timer.current);
    });

    socket.on("connect_error", () => {
      setConnected(false);
      setLoadingAccount(true);
      setLoggingOut(true);

      timer.current && clearInterval(timer.current);
      timer.current = setInterval(() => {
        setLoggingOut(false);
        setShouldConnect(true);
      }, 5000);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setLoadingAccount(true);
      setLoggingOut(true);

      timer.current && clearInterval(timer.current);
      timer.current = setInterval(() => {
        setLoggingOut(false);
        setShouldConnect(true);
      }, 5000);
    });

    socket.on(EServerEvent.UPDATE_STATS, (updated) => setStats(updated));

    socket.on(EServerEvent.SET_SESSION, ({ session, account }, serverVersion, newActiveMatches) => {
      if (account) {
        const logged = Boolean(me && me.id === account.id);
        if (logged && me) {
          setAccount(me);
        }
        setLogged(logged);
      } else {
        setSession(session);
        setLogged(true);
      }

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

    socket.on(EServerEvent.REFRESH_IDENTITY, (userId, cb) => {
      if (!account || userId !== account.id) {
        return cb(null);
      }
      setShouldConnect(false);
      refetchMe()
        .then(() => {
          setTimeout(() => {
            const token = getIdentityCookie();
            if (token) {
              cb(token);
              setShouldConnect(true);
            }
          });
        })
        .catch(() => {
          cb(null);
        });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off(EServerEvent.SET_SESSION);
      socket.off(EServerEvent.UPDATE_ACTIVE_MATCHES);
      socket.off(EServerEvent.MATCH_DELETED);
      socket.off(EServerEvent.PONG);
      socket.off(EServerEvent.REFRESH_IDENTITY);
      socket.off(EServerEvent.UPDATE_STATS);
      timer.current && clearInterval(timer.current);
    };
  }, [socket, setSession, account, refetchMe, removeCookie, toast, logout, me]);

  const sendUserId = useCallback(
    (newName: string, callback?: (name: string) => void) => {
      if (newName.length > 16) {
        toast.warning("Maximo 16 caracteres");
        return callback?.(account ? account.name : name);
      }

      if (account) {
        return updateProfile(
          { name: newName },
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
                  callback?.(newName);
                });
            },
            onError(e) {
              toast.error(e.message);
              callback?.(newName);
            },
          }
        );
      }
      setName(newName);
      callback?.(newName);
    },
    [account, name, refetchMe, setName, toast, updateProfile]
  );

  const fetchPublicMatches = useCallback(
    (filters: { state?: Array<EMatchState> } = {}) => {
      socket.emit(EClientEvent.LIST_MATCHES, filters, ({ matches }) => {
        setPublicMatches(matches);
      });
    },
    [socket]
  );

  useEffect(() => {
    if (is401(error)) {
      logout();
    }
  }, [error, logout]);

  return (
    <TrucoshiContext.Provider
      value={{
        socket,
        state: {
          stats,
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
          isLoggingIn: isLoadingAccount || isPendingLogin,
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
