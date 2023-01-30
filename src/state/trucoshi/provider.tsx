import { useState, useMemo, useCallback, useEffect, PropsWithChildren, useRef } from "react";
import { io } from "socket.io-client";
import { EClientEvent, EServerEvent, IWaitingPlayCallback } from "trucoshi/dist/server/types";
import { IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import useStateStorage from "../../hooks/useStateStorage";
import { TrucoshiContext } from "./context";
import { ICallbackMatchUpdate } from "./types";

const socket = io("http://localhost:4001");

export const TrucoshiProvider = ({ children }: PropsWithChildren<{}>) => {
  const [match, setMatch] = useState<IPublicMatch | null>(null);
  const [session, setSession] = useStateStorage("session");
  const [id, setId] = useStateStorage("id");
  const [isConnected, setConnected] = useState<boolean>(false); // socket.connected
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<string | null>(null);
  const [isMyTurn, setMyTurn] = useState<boolean>(false);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        EClientEvent.SET_SESSION,
        session,
        id,
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

    socket.on(EServerEvent.UPDATE_MATCH, (match: IPublicMatch) => {
      setMatch(match);
    });

    socket.on(EServerEvent.WAITING_PLAY, (match: IPublicMatch, callback: IWaitingPlayCallback) => {
      if (match) {
        setMatch(match);
        setMyTurn(true);
      }
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

  const playTurnCard = useCallback(
    (cardIdx: number) => {
      if (isMyTurn) {
        socket.emit(EClientEvent.PLAY, { cardIdx });
        setMyTurn(false);
      }
    },
    [isMyTurn]
  );

  const sendUserId = useCallback(
    (id: string) => {
      socket.emit(
        EClientEvent.SET_SESSION,
        session,
        id,
        ({ success, session }: { success: boolean; session: string }) => {
          if (success) {
            setId(id);
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

  const getMatch = useCallback((matchSessionId: string) => {
    socket.emit(
      EClientEvent.GET_MATCH,
      matchSessionId,
      ({ success, match }: { success: boolean; match: IPublicMatch }) => {
        console.log({ success, match });
        if (success && match) {
          return setMatch(match);
        }
      }
    );
  }, []);

  const createMatch = useCallback((callback: ICallbackMatchUpdate) => {
    socket.emit(
      EClientEvent.CREATE_MATCH,
      ({ success, match }: { success: boolean; match: IPublicMatch }) => {
        console.log({ success, match });
        if (match) {
          setMatch(match);
          return callback(null, match);
        }
        callback(new Error("No se pudo crear la partida"));
      }
    );
  }, []);

  const setReady = useCallback((matchSessionId: string, ready: boolean) => {
    socket.emit(EClientEvent.SET_PLAYER_READY, matchSessionId, ready);
  }, []);

  const joinMatch = useCallback((matchSessionId: string) => {
    socket.emit(
      EClientEvent.JOIN_MATCH,
      matchSessionId,
      ({ success, match }: { success: Boolean; match: IPublicMatch }) => {
        if (success && match) {
          setMatch(match);
        }
        console.error("Could not join match");
      }
    );
  }, []);

  const startMatch = useCallback(() => {
    socket.emit(EClientEvent.START_MATCH);
  }, []);

  const state = useMemo(
    () => ({
      match,
      session,
      id,
      isConnected,
      isLogged,
      lastPong,
      isMyTurn,
    }),
    [id, isConnected, isLogged, lastPong, match, session, isMyTurn]
  );

  const dispatch = useMemo(
    () => ({
      sendPing,
      setReady,
      createMatch,
      getMatch,
      sendUserId,
      startMatch,
      joinMatch,
      playTurnCard,
    }),
    [createMatch, getMatch, joinMatch, playTurnCard, sendPing, sendUserId, setReady, startMatch]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch]
  );

  return <TrucoshiContext.Provider value={value}>{children}</TrucoshiContext.Provider>;
};
