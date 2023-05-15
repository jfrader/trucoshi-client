import { useState, useCallback, useEffect, PropsWithChildren } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  EClientEvent,
  EMatchState,
  EServerEvent,
  IPublicMatchInfo,
  ServerToClientEvents,
} from "trucoshi";
import useStateStorage from "../../hooks/useStateStorage";
import { createContext } from "react";
import { ICardTheme, ITrucoshiContext } from "../types";
import { useCards } from "../hooks/useCards";

const HOST = process.env.REACT_APP_HOST || "http://localhost:4001";
const CLIENT_VERSION = process.env.REACT_APP_VERSION || "";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(HOST);

const sendPing = () => {
  socket.emit(EClientEvent.PING, Date.now());
};

export const TrucoshiProvider = ({ children }: PropsWithChildren<{}>) => {
  const [version, setVersion] = useState("");
  const [session, setSession] = useStateStorage("session");
  const [id, setId] = useStateStorage("id");
  const [isConnected, setConnected] = useState<boolean>(false); // socket.connected
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [serverAheadTime, setServerAheadTime] = useState<number>(0);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [cardTheme, setCardTheme] = useStateStorage<ICardTheme>("cardtheme", "gnu");
  const [cards, cardsReady] = useCards({ theme: cardTheme, disabled: !cardTheme });

  useEffect(() => {
    socket.on("connect", () => {
      sendPing();
      setConnected(true);
      socket.emit(
        EClientEvent.SET_SESSION,
        id,
        session,
        ({ success, serverVersion, session: newSession, activeMatches: newActiveMatches }) => {
          setVersion(CLIENT_VERSION + "-" + serverVersion);
          setLogged(true);
          if (!success && newSession) {
            setSession(newSession);
          }
          setActiveMatches(newActiveMatches);
        }
      );
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setLogged(false);
    });

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
  }, [id, session, setSession]);

  const sendUserId = useCallback(
    (userId: string, callback?: () => void) => {
      socket.emit(EClientEvent.SET_SESSION, userId, session, ({ success, session }) => {
        if (success) {
          setId(userId);
          if (session) {
            setSession(session);
          }
          setLogged(true);
          callback?.();
        }
      });
    },
    [session, setId, setSession]
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
            version,
            publicMatches,
            session,
            id,
            isConnected,
            isLogged,
            lastPong,
            activeMatches,
            serverAheadTime,
            cardTheme,
            cardsReady,
            cards,
          },
          dispatch: {
            setCardTheme,
            sendPing,
            sendUserId,
            setActiveMatches,
            fetchPublicMatches,
          },
        } satisfies ITrucoshiContext
      }
    >
      {children}
    </TrucoshiContext.Provider>
  );
};
