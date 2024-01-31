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
  IPlayedCard,
  ISaidCommand,
  ILobbyOptions,
} from "trucoshi";

import { TrucoshiContext } from "../context";
import { ICallbackMatchUpdate, ITrucoshiMatchActions, ITrucoshiMatchState } from "../types";
import { usePayRequest } from "../../api/hooks/usePayRequest";
import { useToast } from "../../hooks/useToast";
import { useRefreshTokens } from "../../api/hooks/useRefreshTokens";
import { AxiosError } from "axios";
import { getIdentityCookie } from "../../utils/cookie";

export interface UseMatchOptions {
  onMyTurn?: () => void;
  onFreshHand?: () => void;
  onPlayedCard?: (pc: IPlayedCard) => void;
  onSaidCommand?: (sc: ISaidCommand) => void;
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
  const [hash, setHash] = useState("");

  const { pay } = usePayRequest();
  const { refreshTokens } = useRefreshTokens();

  const { onMyTurn, onFreshHand, onPlayedCard, onSaidCommand } = options;

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const { socket } = context;

  const fetchMatch = useCallback(() => {
    if (matchId && context.state.isConnected) {
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
  }, [context.dispatch, context.state.activeMatches, context.state.isConnected, matchId, socket]);

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
      const matchHash = JSON.stringify(value);
      if (hash === matchHash) {
        return;
      }
      setHash(matchHash);
      _setMatch(value);
      const _me = value.players.find((player) => player.isMe);
      const _turnPlayer = value.players.find((player) => player.isTurn) || null;
      setMe(_me || null);
      setTurnPlayer(_turnPlayer);
    },
    [hash]
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
      if (me?.payRequestId) {
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
        ({ success, match, activeMatches }) => {
          if (activeMatches) {
            context.dispatch.setActiveMatches(activeMatches);
          }
          if (error) {
            toast.error(error.message);
          }
          if (success && match) {
            return setMatch(match);
          }
        }
      );
    },
    [context.dispatch, error, setMatch, socket, toast]
  );

  const makeRefreshTokens = (
    onSuccess: () => void,
    onError: (e: AxiosError) => void
  ) => {
    return refreshTokens(
      { withCredentials: true },
      {
        onSettled() {
          onSuccess();
        },
        onError(e) {
          onError(e);
        },
      }
    );
  };

  const setOptions = (
    options: Partial<ILobbyOptions>,
    cb: (success: boolean) => void,
    retry?: boolean,
  ) => {
    if (!matchId || !match) {
      return;
    }

    const identity = getIdentityCookie();

    socket.emit(
      EClientEvent.SET_MATCH_OPTIONS,
      identity,
      matchId,
      options,
      ({ success, activeMatches, match, error }) => {
        if (error) {
          if (!retry) {
            return makeRefreshTokens(
              () => {
                setOptions(options, cb, true);
              },
              () => {
                toast.error("No se pudieron guardar las reglas, intenta nuevamente.");
              }
            );
          }
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

  const startMatch = (retry?: boolean) => {
    if (!matchId || !match) {
      return;
    }

    const identity = getIdentityCookie();

    socket.emit(EClientEvent.START_MATCH, identity, matchId, ({ error }) => {
      if (error) {
        if (!retry) {
          return makeRefreshTokens(
            () => {
              startMatch(true);
            },
            () => {
              toast.error("No se pudo empezar la partida, intenta nuevamente o inicia sesion.");
            }
          );
        }
        toast.error(error.message);
      }
    });
  };

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

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

    socket.on(EServerEvent.PLAYER_USED_CARD, (value, card) => {
      if (value.matchSessionId === matchId) {
        onPlayedCard?.(card);
      }
    });

    socket.on(EServerEvent.PLAYER_SAID_COMMAND, (value, command) => {
      if (value.matchSessionId === matchId) {
        onSaidCommand?.(command);
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
      socket.off(EServerEvent.PLAYER_USED_CARD);
      socket.off(EServerEvent.PLAYER_SAID_COMMAND);
    };
  }, [matchId, onMyTurn, onFreshHand, onPlayedCard, onSaidCommand, setMatch, socket]);

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
