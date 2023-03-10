import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  IPublicMatch,
  ICard,
  EClientEvent,
  EServerEvent,
  IWaitingPlayCallback,
  IWaitingSayCallback,
  IPublicPlayer,
  ESayCommand,
  IMatchPreviousHand,
} from "trucoshi";
import { TrucoshiContext } from "../state/context";
import { ICallbackMatchUpdate, ITrucoshiMatchActions, ITrucoshiMatchState } from "../types";

export const useMatch = (matchId?: string | null): [ITrucoshiMatchState, ITrucoshiMatchActions] => {
  const context = useContext(TrucoshiContext);

  const [match, _setMatch] = useState<IPublicMatch | null>(null);
  const [me, setMe] = useState<IPublicPlayer | null>(null);
  const [turnCallback, setTurnCallback] = useState<IWaitingPlayCallback | null>(null);
  const [sayCallback, setSayCallback] = useState<IWaitingSayCallback | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [previousHand, setPreviousHand] = useState<[IMatchPreviousHand, () => void] | null>(null);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const setMatch = useCallback(
    (value: IPublicMatch) => {
      _setMatch(value);
      const _me = value.players.find((player) => player.session === context.state.session);
      setMe(_me || null);
    },
    [context.state.session]
  );

  const isMe = useCallback(
    (player: IPublicPlayer) => player.session === context.state.session,
    [context.state.session]
  );

  const { socket } = context;

  const createMatch = useCallback(
    (callback: ICallbackMatchUpdate) => {
      socket.emit(EClientEvent.CREATE_MATCH, ({ match }) => {
        if (match) {
          setMatch(match);
          return callback(null, match);
        }
        callback(new Error("No se pudo crear la partida"));
      });
    },
    [setMatch, socket]
  );

  const setReady = useCallback(
    (matchSessionId: string, ready: boolean) => {
      socket.emit(EClientEvent.SET_PLAYER_READY, matchSessionId, ready, ({ success, match }) => {
        if (success && match) {
          setMatch(match);
          return;
        }
        console.error("Could not set as ready or unready");
      });
    },
    [setMatch, socket]
  );

  const joinMatch = useCallback(
    (matchId: string, teamIdx?: 0 | 1) => {
      socket.emit(EClientEvent.JOIN_MATCH, matchId, teamIdx, ({ match, success }) => {
        if (match) {
          return setMatch(match);
        }
        console.error("Could not join match");
      });
    },
    [setMatch, socket]
  );

  const startMatch = useCallback(() => {
    socket.emit(EClientEvent.START_MATCH, ({ success }) => {
      if (!success) {
        console.error("Couldn't start match");
      }
    });
  }, [socket]);

  useEffect(() => {
    if (matchId) {
      socket.emit(EClientEvent.FETCH_MATCH, context.state.session, matchId, ({ success }) => {
        if (!success) {
          setError(new Error("No se pudo encontrar la partida"));
          return;
        }
        setError(null);
      });
    }
  }, [matchId, context.state.id, socket, context.state.session]);

  useEffect(() => {
    socket.on(EServerEvent.UPDATE_MATCH, (value: IPublicMatch) => {
      if (value.matchSessionId === matchId) {
        setMatch(value);
      }
    });

    socket.on(EServerEvent.WAITING_PLAY, (value, callback) => {
      if (value.matchSessionId === matchId) {
        setMatch(value);
        setTurnCallback(() => callback);
      }
    });

    socket.on(EServerEvent.WAITING_POSSIBLE_SAY, (value, callback) => {
      if (value.matchSessionId === matchId) {
        setMatch(value);
        setSayCallback(() => callback);
      }
    });

    socket.on(EServerEvent.PREVIOUS_HAND, (value, callback) => {
      if (value.matchSessionId === matchId) {
        setPreviousHand([value, callback]);
      }
    });

    return () => {
      socket.off(EServerEvent.PREVIOUS_HAND);
      socket.off(EServerEvent.UPDATE_MATCH);
      socket.off(EServerEvent.WAITING_PLAY);
      socket.off(EServerEvent.WAITING_POSSIBLE_SAY);
    };
  }, [matchId, setMatch, socket]);

  const playCard = useCallback(
    (cardIdx: number, card: ICard) => {
      if (match && turnCallback) {
        turnCallback({
          cardIdx,
          card,
        });
        setTurnCallback(null);
      }
    },
    [match, turnCallback]
  );

  const sayCommand = useCallback(
    (command: ESayCommand) => {
      if (match && sayCallback) {
        sayCallback({
          command,
        });
        setSayCallback(null);
      }
    },
    [match, sayCallback]
  );

  const leaveMatch = useCallback(() => {
    if (matchId && match && match.winner) {
      socket.emit(EClientEvent.LEAVE_MATCH, matchId);
    }
  }, [match, matchId, socket]);

  const nextHand = useCallback(() => {
    if (match && previousHand && previousHand[1]) {
      previousHand[1]();
      setPreviousHand(null);
    }
  }, [match, previousHand]);

  const canPlay = useMemo(() => Boolean(match && turnCallback), [match, turnCallback]);
  const canSay = useMemo(() => Boolean(match && sayCallback), [match, sayCallback]);

  return [
    { match, me, error, canPlay, canSay, previousHand: previousHand ? previousHand[0] : null },
    {
      isMe,
      playCard,
      sayCommand,
      joinMatch,
      setReady,
      startMatch,
      createMatch,
      leaveMatch,
      nextHand,
    },
  ];
};
