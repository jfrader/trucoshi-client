import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  IPublicMatch,
  ICard,
  EClientEvent,
  EServerEvent,
  IWaitingPlayCallback,
  IWaitingSayCallback,
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
  onUnpause?: (unpausesAt: number) => void;
  onPauseRequest?: (
    fromOpponent: boolean,
    expiresAt: number,
    answer: (answer: boolean) => void
  ) => void;
  onPlayAgainRequest?: (expiresAt: number) => void;
  onPlayAgain?: (newMatchSessionId: string) => void;
}

export const useMatch = (
  matchId?: string | null,
  options: UseMatchOptions = {}
): [ITrucoshiMatchState & { canPlay: boolean; canSay: boolean }, ITrucoshiMatchActions] => {
  const context = useContext(TrucoshiContext);
  const toast = useToast();
  const { pay } = usePayRequest();
  const { onMyTurn, onFreshHand, onPauseRequest, onUnpause, onPlayAgainRequest, onPlayAgain } =
    options;
  const optionCallbacksRef = useRef({
    onMyTurn,
    onFreshHand,
    onPauseRequest,
    onUnpause,
    onPlayAgainRequest,
    onPlayAgain,
  });

  useEffect(() => {
    optionCallbacksRef.current = {
      onMyTurn,
      onFreshHand,
      onPauseRequest,
      onUnpause,
      onPlayAgainRequest,
      onPlayAgain,
    };
  }, [onMyTurn, onFreshHand, onPauseRequest, onUnpause, onPlayAgainRequest, onPlayAgain]);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const {
    socket,
    state: { isConnected, isLoggingIn, activeMatches },
    dispatch,
  } = context;

  const [matchState, setMatchState] = useState<ITrucoshiMatchState>({
    match: null,
    stats: null,
    turnPlayer: null,
    me: null,
    turnCallback: null,
    sayCallback: null,
    error: null,
  });

  const canPlay = useMemo(
    () =>
      Boolean(
        matchState.match &&
          matchState.turnCallback &&
          matchState.me &&
          !matchState.me.abandoned &&
          matchState.match.handState !== EHandState.DISPLAY_FLOR_BATTLE &&
          matchState.match.handState !== EHandState.DISPLAY_PREVIOUS_HAND
      ),
    [matchState.match, matchState.me, matchState.turnCallback]
  );

  const canSay = useMemo(
    () =>
      Boolean(
        matchState.match &&
          matchState.sayCallback &&
          matchState.me &&
          !matchState.me.abandoned &&
          matchState.match.handState !== EHandState.DISPLAY_FLOR_BATTLE &&
          matchState.match.handState !== EHandState.DISPLAY_PREVIOUS_HAND
      ),
    [matchState.match, matchState.me, matchState.sayCallback]
  );

  const fetchMatch = useCallback(() => {
    if (!isConnected || !matchId) {
      setMatchState((prev) => ({
        ...prev,
        error: new Error("No se pudo encontrar la partida"),
      }));
      dispatch.setActiveMatches(activeMatches.filter((m) => m.matchSessionId !== matchId));
      return;
    }
    socket.emit(EClientEvent.FETCH_MATCH, matchId, ({ success, match }) => {
      if (!success || !match) {
        setMatchState((prev) => ({
          ...prev,
          error: new Error("No se pudo encontrar la partida"),
        }));
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

  const pauseMatch = useCallback(
    (pause: boolean) => {
      if (matchId && isConnected) {
        socket.emit(EClientEvent.PAUSE_MATCH, matchId, pause, () => {});
      }
    },
    [isConnected, matchId, socket]
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
          setMatchState((prev) => ({
            ...prev,
            match,
            me: match.players.find((player) => player.isMe) || null,
            turnPlayer: match.players.find((player) => player.isTurn) || null,
            error: null,
          }));
          return callback(null, match);
        }
        callback(error || new Error("No se pudo crear la partida"));
      });
    },
    [socket, dispatch, toast]
  );

  const createTutorialMatch = useCallback(
    (callback: ICallbackMatchUpdate) => {
      (socket as any).emit(
        "CREATE_TUTORIAL_MATCH",
        undefined,
        ({ match, activeMatches, error }: any) => {
          if (activeMatches) {
            dispatch.setActiveMatches(activeMatches);
          }
          if (error) {
            toast.error(error.message);
          }
          if (match) {
            setMatchState((prev) => ({
              ...prev,
              match,
              me: match.players.find((player: any) => player.isMe) || null,
              turnPlayer: match.players.find((player: any) => player.isTurn) || null,
              error: null,
            }));
            return callback(null, match);
          }
          callback(error || new Error("No se pudo crear el tutorial"));
        },
      );
    },
    [socket, dispatch, toast],
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
            setMatchState((prev) => ({
              ...prev,
              match,
              me: match.players.find((player) => player.isMe) || null,
              turnPlayer: match.players.find((player) => player.isTurn) || null,
              error: null,
            }));
          }
        }
      );
    },
    [socket, toast]
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
          setMatchState((prev) => ({
            ...prev,
            match,
            me: match.players.find((player) => player.isMe) || null,
            turnPlayer: match.players.find((player) => player.isTurn) || null,
            error: null,
          }));
        }
      });
    },
    [socket, toast]
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
            setMatchState((prev) => ({
              ...prev,
              match,
              me: match.players.find((player) => player.isMe) || null,
              turnPlayer: match.players.find((player) => player.isTurn) || null,
              error: null,
            }));
          }
        }
      );
    },
    [socket, dispatch, toast]
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
            setMatchState((prev) => ({
              ...prev,
              match,
              me: match.players.find((player) => player.isMe) || null,
              turnPlayer: match.players.find((player) => player.isTurn) || null,
              error: null,
            }));
          }
        }
      );
    },
    [matchId, matchState.match, socket, dispatch, toast]
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
      if (matchState.match && !matchState.match.tutorial?.inputLocked && matchState.turnCallback) {
        matchState.turnCallback({ cardIdx, card });
        setMatchState((prev) => ({ ...prev, turnCallback: null }));
      }
    },
    [matchState]
  );

  const sayCommand = useCallback(
    (command: ESayCommand) => {
      if (matchState.match && !matchState.match.tutorial?.inputLocked && matchState.sayCallback) {
        matchState.sayCallback({ command });
        setMatchState((prev) => ({ ...prev, sayCallback: null }));
      }
    },
    [matchState]
  );

  const leaveMatch = useCallback(() => {
    if (matchId && matchState.match) {
      socket.emit(EClientEvent.LEAVE_MATCH, matchId, ({ activeMatches }) => {
        if (activeMatches) {
          context.dispatch.setActiveMatches(activeMatches)
        }
      });
    }
  }, [matchId, matchState.match, socket]);

  const playAgain = useCallback(
    (callback: (newMatchSessionId?: string) => void) => {
      if (matchId && matchState.match) {
        socket.emit(EClientEvent.PLAY_AGAIN, matchId, ({ newMatchSessionId }) => {
          callback(newMatchSessionId);
        });
      }
    },
    [matchId, matchState.match, socket]
  );

  useEffect(() => {
    if (isConnected && !matchState.match && !matchState.error && !isLoggingIn && matchId) {
      fetchMatch();
    }
  }, [isConnected, isLoggingIn, matchState.match, matchState.error, matchId, fetchMatch]);

  useEffect(() => {
    if (!isConnected && matchState.match) {
      setMatchState({
        match: null,
        stats: null,
        me: null,
        turnPlayer: null,
        error: null,
        turnCallback: null,
        sayCallback: null,
      });
    }
  }, [isConnected, matchState.match]);

  useEffect(() => {
    const handleUpdateMatch = (value: IPublicMatch, stats?: IPublicMatchStats) => {
      if (matchId && value.matchSessionId === matchId) {
        setMatchState((prev) => ({
          ...prev,
          match: value,
          stats: stats || prev.stats,
          me: value.players.find((player) => player.isMe) || null,
          turnPlayer: value.players.find((player) => player.isTurn) || null,
          error: null,
        }));
      }
    };

    const handleWaitingPlay = (value: IPublicMatch, callback: IWaitingPlayCallback) => {
      if (matchId && value.matchSessionId === matchId) {
        setMatchState((prev) => ({
          ...prev,
          match: value,
          me: value.players.find((player) => player.isMe) || null,
          turnPlayer: value.players.find((player) => player.isTurn) || null,
          turnCallback: callback,
          error: null,
        }));
      }
    };

    const handleWaitingSay = (match: IPublicMatch, callback: IWaitingSayCallback) => {
      if (matchId && match.matchSessionId === matchId) {
        if (optionCallbacksRef.current.onFreshHand && match.freshHand) {
          optionCallbacksRef.current.onFreshHand();
        }
        if (optionCallbacksRef.current.onMyTurn && match.me?.isTurn) {
          setTimeout(optionCallbacksRef.current.onMyTurn, 0);
        }
        setMatchState((prev) => ({
          ...prev,
          match,
          me: match.players.find((player) => player.isMe) || null,
          turnPlayer: match.players.find((player) => player.isTurn) || null,
          sayCallback: callback,
          error: null,
        }));
      }
    };

    const handleMatchDeleted = (deletedMatchSessionId: string) => {
      if (deletedMatchSessionId === matchId) {
        setMatchState((prev) => ({
          ...prev,
          error: new Error("Esta partida terminó"),
        }));
      }
    };

    const handlePauseRequest = (
      matchSessionId: string,
      fromOpponent: boolean,
      expiresAt: number,
      answer: (answer: boolean) => void
    ) => {
      if (matchId === matchSessionId) {
        optionCallbacksRef.current.onPauseRequest?.(fromOpponent, expiresAt, answer);
      }
    };

    const handleUnpause = (matchSessionId: string, unpausesAt: number) => {
      if (matchId === matchSessionId) {
        optionCallbacksRef.current.onUnpause?.(unpausesAt);
      }
    };

    const handlePlayAgainRequest = (matchSessionId: string, expiresAt: number) => {
      if (matchId === matchSessionId) {
        optionCallbacksRef.current.onPlayAgainRequest?.(expiresAt);
      }
    };

    socket.on(EServerEvent.UPDATE_MATCH, handleUpdateMatch);
    socket.on(EServerEvent.WAITING_PLAY, handleWaitingPlay);
    socket.on(EServerEvent.WAITING_POSSIBLE_SAY, handleWaitingSay);
    socket.on(EServerEvent.MATCH_DELETED, handleMatchDeleted);
    socket.on(EServerEvent.PAUSE_MATCH_REQUEST, handlePauseRequest);
    socket.on(EServerEvent.UNPAUSE_STARTED, handleUnpause);
    socket.on(EServerEvent.PLAY_AGAIN_REQUEST, handlePlayAgainRequest);

    return () => {
      socket.off(EServerEvent.UPDATE_MATCH, handleUpdateMatch);
      socket.off(EServerEvent.WAITING_PLAY, handleWaitingPlay);
      socket.off(EServerEvent.WAITING_POSSIBLE_SAY, handleWaitingSay);
      socket.off(EServerEvent.MATCH_DELETED, handleMatchDeleted);
      socket.off(EServerEvent.PAUSE_MATCH_REQUEST, handlePauseRequest);
      socket.off(EServerEvent.UNPAUSE_STARTED, handleUnpause);
      socket.off(EServerEvent.PLAY_AGAIN_REQUEST, handlePlayAgainRequest);
    };
  }, [
    socket,
    matchId,
  ]);

  return [
    { ...matchState, canPlay, canSay },
    {
      playCard,
      sayCommand,
      joinMatch,
      setReady,
      setOptions,
      startMatch,
      createMatch,
      createTutorialMatch,
      leaveMatch,
      kickPlayer,
      pauseMatch,
      addBot,
      playAgain,
    },
  ];
};
