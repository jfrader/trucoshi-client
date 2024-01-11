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
  const [cookies, , removeCookie] = useCookies(["jwt:access", "jwt:refresh", "jwt:identity"]);

  const [version, setVersion] = useState("");
  const [name, setName] = useStateStorage("id");
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

  const logout = useCallback(() => {
    setLoadingAccount(true);
    apiLogout({});
    socket.emit(EClientEvent.LOGOUT, ({ success }) => {
      setLoadingAccount(false);
      if (success) {
        setLogged(false);
        setAccount(null);
        removeCookie("jwt:identity");
        return;
      }
    });
  }, [apiLogout, removeCookie]);

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
          ({ success, activeMatches }) => {
            setLoadingAccount(false);
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
          }
        );
      }
    }
  }, [cookies, isLogged, me, removeCookie]);

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

    socket.on(
      EServerEvent.SET_SESSION,
      ({ name, session }, serverVersion, newActiveMatches): void => {
        setName(name);
        setActiveMatches(newActiveMatches);
        setVersion(CLIENT_VERSION + "-" + serverVersion);
        setSession(session);
      }
    );

    socket.on(EServerEvent.UPDATE_ACTIVE_MATCHES, (newActiveMatches) => {
      setActiveMatches(newActiveMatches);
    });

    socket.on(EServerEvent.PONG, (serverTime, clientTime) => {
      setLastPong(serverTime);
      setServerAheadTime(serverTime - clientTime);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(EServerEvent.UPDATE_ACTIVE_MATCHES);
      socket.off(EServerEvent.PONG);
    };
  }, [account?.name, name, session, setName, setSession]);

  const sendUserId = useCallback(
    (userId: string, callback?: () => void) => {
      socket.disconnect();
      setName(userId);
      callback?.();
    },
    [setName]
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
