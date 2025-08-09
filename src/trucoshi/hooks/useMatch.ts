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
  ILobbyOptions,
  EHandState,
  IPublicMatchStats,
} from "trucoshi";
import { TrucoshiContext } from "../trucoshi.context";
import { ICallbackMatchUpdate, ITrucoshiMatchActions, ITrucoshiMatchState } from "../types";
import { useToast } from "../../hooks/useToast";
import { usePayRequest } from "../../api/hooks/usePayRequest";

export interface UseMatchOptions {
  onMyTurn?: () => void;
  onFreshHand?: () => void;
}

export const useMatch = (
  matchId?: string | null,
  options: UseMatchOptions = {}
): [ITrucoshiMatchState, ITrucoshiMatchActions] => {
  const context = useContext(TrucoshiContext);
  const toast = useToast();
  const { pay } = usePayRequest();
  const { onMyTurn, onFreshHand } = options;

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const {
    socket,
    state: { isConnected, isLoggingIn, activeMatches },
    dispatch,
  } = context;

  const [matchState, setMatchState] = useState<{
    match: IPublicMatch | null;
    stats: IPublicMatchStats | null;
    turnPlayer: IPublicPlayer | null;
    me: IPublicPlayer | null;
    turnCallback: IWaitingPlayCallback | null;
    sayCallback: IWaitingSayCallback | null;
    error: Error | null;
  }>({
    match: null,
    stats: null,
    turnPlayer: null,
    me: null,
    turnCallback: null,
    sayCallback: null,
    error: null,
  });

  const fetchMatch = useCallback(() => {
    if (!isConnected || !matchId) {
      setMatchState((prev) => ({ ...prev, error: new Error("No se pudo encontrar la partida") }));
      dispatch.setActiveMatches(activeMatches.filter((m) => m.matchSessionId !== matchId));
      return;
    }
    socket.emit(EClientEvent.FETCH_MATCH, matchId, ({ success, match }) => {
      if (!success || !match) {
        setMatchState((prev) => ({ ...prev, error: new Error("No se pudo encontrar la partida") }));
        dispatch.setActiveMatches(activeMatches.filter((m) => m.matchSessionId !== matchId));
        return;
      }
      setMatchState((prev) => ({
        ...prev,
        match,
        me: match.players.find((player) => player.isMe) || null,
        turnPlayer: match.players.find((player) => player.isTurn) || null,
        error: null,
      }));
    });
  }, [isConnected, matchId, socket, dispatch, activeMatches]);

  const setMatch = useCallback(
    (match: IPublicMatch, stats?: IPublicMatchStats) => {
      if (matchId && match.matchSessionId === matchId) {
        setMatchState((prev) => ({
          ...prev,
          match,
          stats: stats || prev.stats,
          me: match.players.find((player) => player.isMe) || null,
          turnPlayer: match.players.find((player) => player.isTurn) || null,
          error: null,
        }));
      }
    },
    [matchId]
  );

  const kickPlayer = useCallback(
    (key: string) => {
      if (matchId && isConnected) {
        socket.emit(EClientEvent.KICK_PLAYER, matchId, key, ({ error }) => {
          if (error) {
            toast.error(error.message);
          }
        });
      }
    },
    [isConnected, matchId, socket, toast]
  );

  const createMatch = useCallback(
    (callback: ICallbackMatchUpdate) => {
      socket.emit(EClientEvent.CREATE_MATCH, ({ match, activeMatches, error }) => {
        if (activeMatches) {
          dispatch.setActiveMatches(activeMatches);
        }
        if (error) {
          toast.error(error.message);
        }
        if (match) {
          setMatch(match);
          return callback(null, match);
        }
        callback(error || new Error("No se pudo crear la partida"));
      });
    },
    [socket, dispatch, setMatch, toast]
  );

  const emitReady = useCallback(
    (matchSessionId: string, ready: boolean, cb: (success: boolean) => void) => {
      socket.emit(
        EClientEvent.SET_PLAYER_READY,
        matchSessionId,
        ready,
        ({ success, match, error }) => {
          cb(success);
          if (error) {
            toast.error(error.message);
          }
          if (success && match) {
            setMatch(match);
          }
        }
      );
    },
    [socket, setMatch, toast]
  );

  const setReady = useCallback(
    (matchSessionId: string, ready: boolean, cb: (success: boolean) => void) => {
      if (matchState.me?.payRequestId && ready) {
        pay(String(matchState.me.payRequestId), {
          onSettled() {
            dispatch.refetchMe();
            emitReady(matchSessionId, ready, cb);
          },
          onError(e) {
            if (e.status !== 409) {
              toast.error("Hubo un error al pagar la entrada de la partida, intenta nuevamente");
            }
          },
        });
      } else {
        emitReady(matchSessionId, ready, cb);
      }
    },
    [matchState.me, pay, dispatch, emitReady, toast]
  );

  const addBot = useCallback(
    (matchId: string, cb: (success: boolean) => void, teamIdx?: 0 | 1) => {
      socket.emit(EClientEvent.ADD_BOT, matchId, teamIdx, ({ success, match, error }) => {
        cb(success);
        if (error) {
          toast.error(error.message);
        }
        if (success && match) {
          setMatch(match);
        }
      });
    },
    [socket, setMatch, toast]
  );

  const joinMatch = useCallback(
    (matchId: string, cb: (success: boolean) => void, teamIdx?: 0 | 1) => {
      socket.emit(
        EClientEvent.JOIN_MATCH,
        matchId,
        teamIdx,
        ({ success, match, activeMatches, error }) => {
          cb(success);
          if (activeMatches) {
            dispatch.setActiveMatches(activeMatches);
          }
          if (error) {
            toast.error(error.message);
          }
          if (success && match) {
            setMatch(match);
          }
        }
      );
    },
    [socket, dispatch, setMatch, toast]
  );

  const setOptions = useCallback(
    (options: Partial<ILobbyOptions>, cb: (success: boolean) => void) => {
      if (!matchId || !matchState.match) {
        cb(false);
        return;
      }
      socket.emit(
        EClientEvent.SET_MATCH_OPTIONS,
        matchId,
        options,
        ({ success, activeMatches, match, error }) => {
          cb(success);
          if (error) {
            toast.error(error.message);
          }
          if (activeMatches) {
            dispatch.setActiveMatches(activeMatches);
          }
          if (match) {
            setMatch(match);
          }
        }
      );
    },
    [matchId, matchState.match, socket, dispatch, setMatch, toast]
  );

  const startMatch = useCallback(
    (cb: (success: boolean) => void) => {
      if (!matchId || !matchState.match) {
        cb(false);
        return;
      }
      socket.emit(EClientEvent.START_MATCH, matchId, ({ error, success }) => {
        cb(success);
        if (error) {
          toast.error(error.message);
        }
      });
    },
    [matchId, matchState.match, socket, toast]
  );

  const playCard = useCallback(
    (cardIdx: number, card: ICard) => {
      if (matchState.match && matchState.turnCallback) {
        matchState.turnCallback({ cardIdx, card });
        setMatchState((prev) => ({ ...prev, turnCallback: null }));
      }
    },
    [matchState]
  );

  const sayCommand = useCallback(
    (command: ESayCommand) => {
      if (matchState.match && matchState.sayCallback) {
        matchState.sayCallback({ command });
        setMatchState((prev) => ({ ...prev, sayCallback: null }));
      }
    },
    [matchState]
  );

  const leaveMatch = useCallback(() => {
    if (matchId && matchState.match) {
      socket.emit(EClientEvent.LEAVE_MATCH, matchId);
      setMatchState((prev) => ({
        ...prev,
        match: null,
        stats: null,
        me: null,
        turnPlayer: null,
        error: null,
      }));
    }
  }, [matchId, matchState.match, socket]);

  useEffect(() => {
    if (isConnected && !matchState.match && !matchState.error && !isLoggingIn && matchId) {
      fetchMatch();
    }
  }, [isConnected, isLoggingIn, matchState.match, matchState.error, matchId, fetchMatch]);

  useEffect(() => {
    if (!isConnected && matchState.match) {
      setMatchState((prev) => ({
        ...prev,
        match: null,
        stats: null,
        me: null,
        turnPlayer: null,
        error: null,
      }));
    }
  }, [isConnected, matchState.match]);

  useEffect(() => {
    const handleUpdateMatch = (value: IPublicMatch, stats?: IPublicMatchStats) => {
      if (matchId && value.matchSessionId === matchId) {
        setMatch(value, stats);
      }
    };

    const handleWaitingPlay = (value: IPublicMatch, callback: IWaitingPlayCallback) => {
      if (matchId && value.matchSessionId === matchId) {
        setMatch(value);
        setMatchState((prev) => ({ ...prev, turnCallback: callback }));
      }
    };

    const handleWaitingSay = (value: IPublicMatch, callback: IWaitingSayCallback) => {
      if (matchId && value.matchSessionId === matchId) {
        if (onFreshHand && value.freshHand) {
          onFreshHand();
        }
        if (onMyTurn && value.me?.isTurn) {
          setTimeout(onMyTurn, 0);
        }
        setMatch(value);
        setMatchState((prev) => ({ ...prev, sayCallback: callback }));
      }
    };

    const handleMatchDeleted = (deletedMatchSessionId: string) => {
      if (deletedMatchSessionId === matchId) {
        setMatchState((prev) => ({ ...prev, error: new Error("Esta partida ya no existe") }));
      }
    };

    socket.on(EServerEvent.UPDATE_MATCH, handleUpdateMatch);
    socket.on(EServerEvent.WAITING_PLAY, handleWaitingPlay);
    socket.on(EServerEvent.WAITING_POSSIBLE_SAY, handleWaitingSay);
    socket.on(EServerEvent.MATCH_DELETED, handleMatchDeleted);

    return () => {
      socket.off(EServerEvent.UPDATE_MATCH, handleUpdateMatch);
      socket.off(EServerEvent.WAITING_PLAY, handleWaitingPlay);
      socket.off(EServerEvent.WAITING_POSSIBLE_SAY, handleWaitingSay);
      socket.off(EServerEvent.MATCH_DELETED, handleMatchDeleted);
    };
  }, [socket, matchId, onMyTurn, onFreshHand, setMatch]);

  const canPlay = useMemo(
    () => Boolean(matchState.match && matchState.turnCallback),
    [matchState.match, matchState.turnCallback]
  );

  const canSay = useMemo(
    () =>
      Boolean(
        matchState.match &&
          matchState.sayCallback &&
          matchState.match.handState !== EHandState.DISPLAY_FLOR_BATTLE &&
          matchState.match.handState !== EHandState.DISPLAY_PREVIOUS_HAND
      ),
    [matchState.match, matchState.sayCallback]
  );

  const state = useMemo(() => ({ ...matchState, canSay, canPlay }), [canPlay, canSay, matchState]);

  return [
    state,
    {
      playCard,
      sayCommand,
      joinMatch,
      setReady,
      setOptions,
      startMatch,
      createMatch,
      leaveMatch,
      kickPlayer,
      addBot,
    },
  ];
};
