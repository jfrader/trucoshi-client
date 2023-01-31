import { useState, useMemo, useCallback, useEffect, PropsWithChildren } from "react";
import { io } from "socket.io-client";
import { EClientEvent, EServerEvent } from "trucoshi/dist/server/types";
import useStateStorage from "../../hooks/useStateStorage";
import { TrucoshiContext } from "./context";

export const socket = io("http://localhost:4001");

export const TrucoshiProvider = ({ children }: PropsWithChildren<{}>) => {
  const [session, setSession] = useStateStorage("session");
  const [id, setId] = useStateStorage("id");
  const [isConnected, setConnected] = useState<boolean>(false); // socket.connected
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        EClientEvent.SET_SESSION,
        session,
        id,
        null,
        ({ success, session }: { success: boolean; session: string }) => {
          setLogged(success);
          if (success && session) {
            setSession(session);
          }
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
    (userId: string) => {
      socket.emit(
        EClientEvent.SET_SESSION,
        session,
        userId,
        null,
        ({ success, session }: { success: boolean; session: string }) => {
          if (success) {
            setId(userId);
            if (session) {
              setSession(session);
            }
            setLogged(true);
          }
        }
      );
    },
    [session, setId, setSession]
  );

  const state = useMemo(
    () => ({
      session,
      id,
      isConnected,
      isLogged,
      lastPong,
    }),
    [id, isConnected, isLogged, lastPong, session]
  );

  const dispatch = useMemo(
    () => ({
      sendPing,
      sendUserId,
    }),
    [sendPing, sendUserId]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      socket,
    }),
    [state, dispatch]
  );

  return <TrucoshiContext.Provider value={value}>{children}</TrucoshiContext.Provider>;
};
