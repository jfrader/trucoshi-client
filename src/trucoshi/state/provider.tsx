import { useState, useMemo, useCallback, useEffect, PropsWithChildren } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  EClientEvent,
  EMatchTableState,
  EServerEvent,
  IPublicMatchInfo,
  ServerToClientEvents,
} from "trucoshi";
import useStateStorage from "../../hooks/useStateStorage";
import { TrucoshiContext } from "./context";

const HOST = process.env.REACT_APP_HOST || "http://localhost:4001";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(HOST);

export const TrucoshiProvider = ({ children }: PropsWithChildren<{}>) => {
  const [session, setSession] = useStateStorage("session");
  const [id, setId] = useStateStorage("id");
  const [isConnected, setConnected] = useState<boolean>(false); // socket.connected
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<string | null>(null);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        EClientEvent.SET_SESSION,
        id,
        session,
        ({ success, session: newSession, activeMatches: newActiveMatches }) => {
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

    socket.on(EServerEvent.PONG, (msg: string) => {
      setLastPong(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(EServerEvent.PONG);
    };
  }, [id, session, setSession]);

  const sendPing = useCallback(() => {
    socket.emit(EClientEvent.PING, new Date().toISOString());
  }, []);

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

  const fetchPublicMatches = useCallback((filters: { state?: Array<EMatchTableState> } = {}) => {
    socket.emit(EClientEvent.LIST_MATCHES, filters, ({ matches }) => {
      setPublicMatches(matches);
    });
  }, []);

  const value = useMemo(
    () => ({
      socket,
      state: {
        publicMatches,
        session,
        id,
        isConnected,
        isLogged,
        lastPong,
        activeMatches,
      },
      dispatch: {
        sendPing,
        sendUserId,
        fetchPublicMatches,
      },
    }),
    [
      publicMatches,
      session,
      id,
      isConnected,
      isLogged,
      lastPong,
      activeMatches,
      sendPing,
      sendUserId,
      fetchPublicMatches,
    ]
  );

  return <TrucoshiContext.Provider value={value}>{children}</TrucoshiContext.Provider>;
};
