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
} from "trucoshi";
import { TrucoshiContext } from "../context";
import { ICallbackMatchUpdate, ITrucoshiMatchActions, ITrucoshiMatchState } from "../types";

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
  const [match, _setMatch] = useState<IPublicMatch | null>(null);
  const [turnPlayer, setTurnPlayer] = useState<IPublicPlayer | null>(null);
  const [me, setMe] = useState<IPublicPlayer | null>(null);
  const [turnCallback, setTurnCallback] = useState<IWaitingPlayCallback | null>(null);
  const [sayCallback, setSayCallback] = useState<IWaitingSayCallback | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [previousHand, setPreviousHand] = useState<[IMatchPreviousHand, () => void] | null>(null);
  const [hash, setHash] = useState("");

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
          return;
        }
        _setMatch(match);
        setError(null);
      });
    }
  }, [context.state.isConnected, matchId, socket]);

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
      socket.emit(EClientEvent.CREATE_MATCH, ({ match, activeMatches }) => {
        if (activeMatches) {
          context.dispatch.setActiveMatches(activeMatches);
        }
        if (match) {
          setMatch(match);
          return callback(null, match);
        }
        callback(new Error("No se pudo crear la partida"));
      });
    },
    [context.dispatch, setMatch, socket]
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
      socket.emit(
        EClientEvent.JOIN_MATCH,
        matchId,
        teamIdx,
        ({ success, match, activeMatches }) => {
          if (activeMatches) {
            context.dispatch.setActiveMatches(activeMatches);
          }
          if (success && match) {
            return setMatch(match);
          }
          console.error("Could not join match");
        }
      );
    },
    [context.dispatch, setMatch, socket]
  );

  const startMatch = useCallback(() => {
    if (!matchId) {
      return;
    }
    socket.emit(EClientEvent.START_MATCH, matchId, ({ success }) => {
      if (!success) {
        console.error("Couldn't start match");
      }
    });
  }, [matchId, socket]);

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
    if (matchId && match && match.winner) {
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
      startMatch,
      createMatch,
      leaveMatch,
      nextHand,
    },
  ];
};
