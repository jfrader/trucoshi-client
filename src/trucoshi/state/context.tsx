import { useState, useCallback, useEffect, PropsWithChildren } from "react";
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
import useStateStorage from "../../hooks/useStateStorage";
import { createContext } from "react";
import { ICardTheme, ITrucoshiContext } from "../types";
import { useCards } from "../hooks/useCards";
import { useMe } from "../../api/hooks/useMe";
import { useCookies } from "react-cookie";
import { Me } from "lightning-accounts";
import { useLogout } from "../../api/hooks/useLogout";
import { useRefreshTokens } from "../../api/hooks/useRefreshTokens";
import { is401 } from "../../api/apiClient";

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

export const TrucoshiProvider = ({ children }: PropsWithChildren<{}>) => {
  const [account, setAccount] = useState<Me | null>(null);
  const [isLoadingAccount, setLoadingAccount] = useState(false);
  const [version, setVersion] = useState("");
  const [session, setSession] = useStateStorage("session");
  const [name, setName] = useStateStorage("id");
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [serverAheadTime, setServerAheadTime] = useState<number>(0);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [cardTheme, setCardTheme] = useStateStorage<ICardTheme>("cardtheme", "gnu");
  const [cards, cardsReady] = useCards({ theme: cardTheme });
  const [inspectedCard, inspectCard] = useState<ICard | null>(null);
  const [cookies, , removeCookie] = useCookies(["jwt:access", "jwt:refresh", "jwt:identity"]);

  const { me, error, isPending: isPendingMe } = useMe();
  const { refreshTokens, isPending: isPendingRefreshTokens } = useRefreshTokens();
  const { logout: apiLogout } = useLogout();

  useEffect(() => {
    if (me && !cookies["jwt:identity"]) {
      refreshTokens({});
    }
  }, [me]);

  const logout = useCallback(() => {
    apiLogout({});
    socket.emit(EClientEvent.LOGOUT, ({ success }) => {
      if (success) {
        setLogged(false);
        setAccount(null);
        removeCookie("jwt:access");
        removeCookie("jwt:refresh");
        removeCookie("jwt:identity");
        return;
      }
    });
  }, []);

  useEffect(() => {
    if (is401(error)) {
      refreshTokens(
        {},
        {
          onError(refreshTokenError) {
            if (is401(refreshTokenError)) {
              logout();
            }
          },
        }
      );
    }
  }, [error]);

  useEffect(() => {
    if (me && cookies["jwt:identity"]) {
      setLoadingAccount(true);
      socket.emit(EClientEvent.LOGIN, me.data, cookies["jwt:identity"], ({ success }) => {
        setLoadingAccount(false);
        if (success) {
          setLogged(true);
          setAccount(me.data);
          return;
        }
        setAccount(null);
        setLogged(false);
        removeCookie("jwt:identity");
      });
    }
  }, [me]);

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
  }, [name, session, setSession]);

  const sendUserId = useCallback(
    (userId: string, callback?: () => void) => {
      socket.disconnect();
      setName(userId);
      callback?.();
    },
    [session, setName, setSession]
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
            inspectedCard,
            isAccountPending: isPendingMe || isPendingRefreshTokens || isLoadingAccount,
            cards,
          },
          dispatch: {
            setCardTheme,
            sendPing,
            sendUserId,
            setActiveMatches,
            fetchPublicMatches,
            inspectCard,
            logout,
          },
        } satisfies ITrucoshiContext
      }
    >
      {children}
    </TrucoshiContext.Provider>
  );
};
