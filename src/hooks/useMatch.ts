import { useCallback, useContext, useEffect, useState } from "react";
import { IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import {
  EClientEvent,
  EServerEvent,
  IWaitingPlayCallback,
  IWaitingPlayData,
} from "trucoshi/dist/server/types";
import { TrucoshiContext } from "../state/trucoshi/context";
import { ICallbackMatchUpdate, ITrucoshiMatchActions } from "../state/trucoshi/types";

export const useMatch = (
  matchId?: string | null
): [IPublicMatch | null, boolean, ITrucoshiMatchActions] => {
  const context = useContext(TrucoshiContext);

  const [match, setMatch] = useState<IPublicMatch | null>(null);
  const [isMyTurn, setMyTurn] = useState<boolean>(false);
  const [turnCallback, setTurnCallback] = useState<IWaitingPlayCallback | null>(null);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const { socket } = context;

  const createMatch = useCallback(
    (callback: ICallbackMatchUpdate) => {
      socket.emit(
        EClientEvent.CREATE_MATCH,
        ({ match }: { success: boolean; match: IPublicMatch }) => {
          if (match) {
            setMatch(match);
            return callback(null, match);
          }
          callback(new Error("No se pudo crear la partida"));
        }
      );
    },
    [socket]
  );

  const fetchMatch = useCallback(() => {
    socket.emit(
      EClientEvent.GET_MATCH,
      matchId,
      ({ match }: { success: boolean; match: IPublicMatch }) => {
        if (!match) {
          return console.error(new Error("No se pudo encontrar la partida"));
        }
        setMatch(match);
      }
    );
  }, [matchId, socket]);

  const setReady = useCallback(
    (matchSessionId: string, ready: boolean) => {
      socket.emit(EClientEvent.SET_PLAYER_READY, matchSessionId, ready);
    },
    [socket]
  );

  const joinMatch = useCallback(
    (matchId: string) => {
      socket.emit(
        EClientEvent.JOIN_MATCH,
        matchId,
        ({ match }: { success: Boolean; match: IPublicMatch }) => {
          if (match) {
            return setMatch(match);
          }
          console.error("Could not join match");
        }
      );
    },
    [socket]
  );

  const startMatch = useCallback(() => {
    socket.emit(EClientEvent.START_MATCH);
  }, [socket]);

  useEffect(() => {
    if (matchId) {
      socket.emit(
        EClientEvent.SET_SESSION,
        context.state.session,
        context.state.id,
        matchId,
        ({ success, session }: { success: boolean; session: string }) => {
          if (success && session) {
            fetchMatch();
          }
        }
      );
    }
  }, [context.state.id, context.state.session, fetchMatch, matchId, socket]);

  useEffect(() => {
    socket.on(EServerEvent.UPDATE_MATCH, (value: IPublicMatch) => {
      if (value.matchSessionId === matchId) {
        setMatch(value);
      }
    });

    socket.on(
      EServerEvent.WAITING_PLAY,
      (value: IPublicMatch, callback: (data: IWaitingPlayData) => void) => {
        if (value.matchSessionId === matchId) {
          setMyTurn(true);
          setMatch(value);

          setTurnCallback(() => callback);
        }
      }
    );

    return () => {
      socket.off(EServerEvent.WAITING_PLAY);
      socket.off(EServerEvent.UPDATE_MATCH);
    };
  }, [matchId, socket]);
 
  const playCard = useCallback(
    (cardIdx: number) => {
      if (match && isMyTurn) {
        if (turnCallback) {
          turnCallback({
            cardIdx,
          });

          setMyTurn(false);
        }
      }
    },
    [isMyTurn, match, turnCallback]
  );

  return [match, isMyTurn, { playCard, fetchMatch, joinMatch, setReady, startMatch, createMatch }];
};
