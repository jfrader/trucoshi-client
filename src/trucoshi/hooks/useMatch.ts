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
  ILobbyOptions,
} from "trucoshi";

import { TrucoshiContext } from "../context";
import { ICallbackMatchUpdate, ITrucoshiMatchActions, ITrucoshiMatchState } from "../types";
import { usePayRequest } from "../../api/hooks/usePayRequest";
import { useToast } from "../../hooks/useToast";

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
  const [match, _setMatch] = useState<IPublicMatch | null>(null);
  const [turnPlayer, setTurnPlayer] = useState<IPublicPlayer | null>(null);
  const [me, setMe] = useState<IPublicPlayer | null>(null);
  const [turnCallback, setTurnCallback] = useState<IWaitingPlayCallback | null>(null);
  const [sayCallback, setSayCallback] = useState<IWaitingSayCallback | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [previousHand, setPreviousHand] = useState<[IMatchPreviousHand, () => void] | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const { pay } = usePayRequest();

  const { onMyTurn, onFreshHand } = options;

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const { socket } = context;

  const fetchMatch = useCallback(() => {
    if (!error && matchId && context.state.isConnected) {
      socket.emit(EClientEvent.FETCH_MATCH, matchId, ({ success, match }) => {
        if (!success) {
          setError(new Error("No se pudo encontrar la partida"));
          context.dispatch.setActiveMatches(
            context.state.activeMatches.filter((m) => m.matchSessionId !== matchId)
          );
          return;
        }
        _setMatch(match);
        setError(null);
      });
    }
  }, [
    context.dispatch,
    context.state.activeMatches,
    context.state.isConnected,
    error,
    matchId,
    socket,
  ]);

  const kickPlayer = useCallback(
    (key: string) => {
      if (matchId && context.state.isConnected) {
        socket.emit(EClientEvent.KICK_PLAYER, matchId, key, ({ error }) => {
          if (error) {
            toast.error(error.message);
          }
        });
      }
    },
    [context.state.isConnected, matchId, socket, toast]
  );

  const setMatch = useCallback(
    (value: IPublicMatch) => {
      if (value.matchSessionId === matchId) {
        console.log({ a: value.me?.turnExpiresAt, b: value.me?.abandonedTime });
        _setMatch(value);
        const _me = value.players.find((player) => player.isMe);
        const _turnPlayer = value.players.find((player) => player.isTurn) || null;
        setMe(_me || null);
        setTurnPlayer(_turnPlayer);
      }
    },
    [matchId]
  );

  const createMatch = useCallback(
    (callback: ICallbackMatchUpdate) => {
      socket.emit(EClientEvent.CREATE_MATCH, ({ match, activeMatches, error }) => {
        if (activeMatches) {
          context.dispatch.setActiveMatches(activeMatches);
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
    [context.dispatch, setMatch, socket, toast]
  );

  const emitReady = useCallback(
    (matchSessionId: string, ready: boolean) => {
      socket.emit(
        EClientEvent.SET_PLAYER_READY,
        matchSessionId,
        ready,
        ({ success, match, error }) => {
          if (error) {
            toast.error(error.message);
          }
          if (success && match) {
            setMatch(match);
            return;
          }
        }
      );
    },
    [setMatch, socket, toast]
  );

  const setReady = useCallback(
    (matchSessionId: string, ready: boolean) => {
      if (me?.payRequestId && ready) {
        return pay(String(me?.payRequestId), {
          onSettled() {
            context.dispatch.refetchMe();
            emitReady(matchSessionId, ready);
          },
          onError(e) {
            if (Number(e.code) === 302) {
              return;
            }
            toast.error("Hubo un error al pagar la entrada de la partida, intenta nuevamente");
          },
        });
      }
      emitReady(matchSessionId, ready);
    },
    [context.dispatch, emitReady, me?.payRequestId, pay, toast]
  );

  const joinMatch = useCallback(
    (matchId: string, teamIdx?: 0 | 1) => {
      socket.emit(
        EClientEvent.JOIN_MATCH,
        matchId,
        teamIdx,
        ({ success, match, activeMatches, error }) => {
          if (activeMatches) {
            context.dispatch.setActiveMatches(activeMatches);
          }
          if (error) {
            console.error({ error });
            toast.error(error.message);
          }
          if (success && match) {
            return setMatch(match);
          }
        }
      );
    },
    [context.dispatch, setMatch, socket, toast]
  );

  const setOptions = (options: Partial<ILobbyOptions>, cb: (success: boolean) => void) => {
    if (!matchId || !match) {
      return;
    }

    socket.emit(
      EClientEvent.SET_MATCH_OPTIONS,
      matchId,
      options,
      ({ success, activeMatches, match, error }) => {
        if (error) {
          toast.error(error.message);
        }

        cb(success);

        if (activeMatches) {
          context.dispatch.setActiveMatches(activeMatches);
        }

        if (match) {
          setMatch(match);
        }
      }
    );
  };

  const startMatch = () => {
    if (!matchId || !match) {
      return;
    }

    socket.emit(EClientEvent.START_MATCH, matchId, ({ error }) => {
      if (error) {
        toast.error(error.message);
      }
    });
  };

  useEffect(() => {
    if (!hydrated || (!match && !error)) {
      fetchMatch();
      setHydrated(true);
    }
  }, [error, fetchMatch, hydrated, match]);

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
        if (onFreshHand && value.freshHand) {
          onFreshHand();
        }

        if (onMyTurn && value.me?.isTurn) {
          setTimeout(onMyTurn);
        }
        setMatch(value);
        setSayCallback(() => callback);
      }
    });

    socket.on(EServerEvent.PREVIOUS_HAND, (value, callback) => {
      if (value.matchSessionId === matchId) {
        setPreviousHand([value, callback]);
      }
    });

    socket.on(EServerEvent.MATCH_DELETED, (deletedMatchSessionId) => {
      if (deletedMatchSessionId === matchId) {
        setError(new Error("Esta partida ya no existe"));
      }
    });

    return () => {
      socket.off(EServerEvent.UPDATE_MATCH);
      socket.off(EServerEvent.WAITING_PLAY);
      socket.off(EServerEvent.WAITING_POSSIBLE_SAY);
      socket.off(EServerEvent.PREVIOUS_HAND);
    };
  }, [matchId, onMyTurn, onFreshHand, setMatch, socket]);

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
    if (matchId && match) {
      socket.emit(EClientEvent.LEAVE_MATCH, matchId);
    }
  }, [match, matchId, socket]);

  const nextHand = useCallback(() => {
    setPreviousHand(null);
    if (match && previousHand && previousHand[1]) {
      previousHand[1]();
    }
  }, [match, previousHand]);

  const canPlay = useMemo(() => Boolean(match && turnCallback), [match, turnCallback]);
  const canSay = useMemo(() => Boolean(match && sayCallback), [match, sayCallback]);
  const memoPreviousHand = useMemo(() => (previousHand ? previousHand[0] : null), [previousHand]);

  return [
    {
      match,
      me,
      turnPlayer,
      error,
      canPlay,
      canSay,
      previousHand: memoPreviousHand,
    },
    {
      playCard,
      sayCommand,
      joinMatch,
      setReady,
      setOptions,
      startMatch,
      createMatch,
      leaveMatch,
      nextHand,
      kickPlayer,
    },
  ];
};
