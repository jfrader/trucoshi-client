import { useState, useCallback, useEffect, PropsWithChildren, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  EClientEvent,
  EMatchState,
  EServerEvent,
  ICard,
  IPublicMatchInfo,
  ServerToClientEvents,
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

const HOST = import.meta.env.VITE_APP_HOST || "http://localhost:4001";
const CLIENT_VERSION = import.meta.env.VITE_APP_VERSION || "";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(HOST, {
  withCredentials: true,
  autoConnect: false,
});

const sendPing = () => {
  socket.emit(EClientEvent.PING, Date.now());
};

export const TrucoshiProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useStateStorage("session");
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [cookies, , removeCookie] = useCookies(["jwt:identity"]);

  const [version, setVersion] = useState("");
  const [name, setName] = useStateStorage("id", "Satoshi" as string);
  const [account, setAccount] = useState<User | null>(null);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [isLoadingAccount, setLoadingAccount] = useState(false);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [serverAheadTime, setServerAheadTime] = useState<number>(0);
  const [cardTheme, setCardTheme] = useStateStorage<ICardTheme>("cardtheme", "gnu");
  const [cards, cardsReady] = useCards({ theme: cardTheme });
  const [inspectedCard, inspectCard] = useState<ICard | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const { me, error, isPending: isPendingMe, refetch: refetchMe } = useMe();
  const { isPending: isPendingRefreshTokens } = useRefreshTokens();
  const { logout: apiLogout } = useLogout();
  const { isPending: isPendingLogin } = useLogin();

  const toast = useToast();

  const logout = useCallback(() => {
    setLoadingAccount(true);
    apiLogout({ withCredentials: true });
    socket.emit(EClientEvent.LOGOUT, ({ success, error }) => {
      setLoadingAccount(false);
      if (error) {
        toast.error(error.message);
      }
      if (success) {
        setLogged(false);
        setAccount(null);
        removeCookie("jwt:identity");
        socket.disconnect();
        return socket.connect();
      }
      toast.error("Hubo un error cerrando la sesion, intenta nuevamente");
    });
  }, [apiLogout, removeCookie, toast]);

  useEffect(() => {
    if (is401(error)) {
      logout();
    }
  }, [error, logout]);

  useEffect(() => {
    if (me && cookies["jwt:identity"]) {
      if (isLogged) {
        setAccount(me);
      } else {
        setLoadingAccount(true);
        socket.emit(
          EClientEvent.LOGIN,
          me,
          cookies["jwt:identity"],
          ({ success, activeMatches, error }) => {
            setLoadingAccount(false);
            if (error) {
              toast.error(error.message);
            }
            if (activeMatches) {
              setActiveMatches(activeMatches);
            }
            if (success) {
              setLogged(true);
              setAccount(me);
              return;
            }
            setAccount(null);
            setLogged(false);
            removeCookie("jwt:identity");
            refetchMe();
          }
        );
      }
    }
  }, [cookies, isLogged, me, refetchMe, removeCookie, setName, toast]);

  useEffect(() => {
    if (!socket.connected) {
      if (session) {
        socket.auth = { sessionID: session, name: account?.name || name };
      }
      socket.connect();
    }

    socket.on("connect", () => {
      sendPing();
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setLogged(false);
    });

    socket.on(EServerEvent.SET_SESSION, ({ session }, serverVersion, newActiveMatches): void => {
      setActiveMatches(newActiveMatches);
      setVersion(CLIENT_VERSION + "-" + serverVersion);
      setSession(session);
    });

    socket.on(EServerEvent.UPDATE_ACTIVE_MATCHES, (newActiveMatches) => {
      setActiveMatches(newActiveMatches);
    });

    socket.on(EServerEvent.MATCH_DELETED, (deletedMatchSessionId) => {
      console.log({ deletedMatchSessionId });
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
      socket.off(EServerEvent.PONG);
    };
  }, [account?.name, name, session, setName, setSession]);

  const sendUserId = useCallback(
    (userId: string, callback?: () => void) => {
      if (account) {
        return callback?.();
      }

      socket.disconnect();
      setName(userId);
      callback?.();
    },
    [account, setName]
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
            isAccountPending: useMemo(
              () => isPendingMe || isPendingRefreshTokens || isLoadingAccount || isPendingLogin,
              [isLoadingAccount, isPendingLogin, isPendingMe, isPendingRefreshTokens]
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
