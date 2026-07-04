import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EClientEvent,
  EServerEvent,
  IJoinQueueOptions,
  IQueueMatchFound,
  IQueueStatus,
} from "trucoshi";
import { useToast } from "../../hooks/useToast";
import { useTrucoshi } from "./useTrucoshi";
import { useSound } from "../../sound/hooks/useSound";

export type MatchQueuePlayerCount = 0 | IJoinQueueOptions["maxPlayers"];
export type JoinMatchQueueOptions = Omit<IJoinQueueOptions, "maxPlayers"> & {
  maxPlayers: MatchQueuePlayerCount;
};

const WAIT_BEFORE_START_SECONDS = 3

export const useMatchQueue = () => {
  const [
    { isConnected, isQueueing, queueStatus: status },
    { setQueueing, setQueueStatus, setQueueReplayOptions },
    socket,
  ] = useTrucoshi();
  const sound = useSound();
  const toast = useToast();
  const navigate = useNavigate();

  const [matchFound, setMatchFound] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);

  const leaveQueue = useCallback(() => {
    if (!isQueueing) {
      setQueueStatus(null);
      setQueueing(false);
      return;
    }

    socket.emit(EClientEvent.LEAVE_QUEUE, ({ error }) => {
      if (error) {
        toast.error(error.message || "No se pudo salir de la cola");
        return;
      }

      sound.queue("menu0");
    });
    setQueueStatus(null);
    setQueueing(false);
  }, [isQueueing, setQueueStatus, setQueueing, socket, toast]);

  const joinQueue = useCallback(
    (options: JoinMatchQueueOptions) => {
      if (!isConnected) {
        toast.warning("Conectando con el servidor...");
        return;
      }

      setQueueing(true);
      setQueueReplayOptions(null);
      socket.emit(
        EClientEvent.JOIN_QUEUE,
        options as IJoinQueueOptions,
        ({ success, status: nextStatus, error }) => {
          if (!success) {
            setQueueing(false);
            setQueueStatus(null);
            toast.error(error?.message || "No se pudo entrar a la cola");
            return;
          }

          sound.queue("menu1");

          setQueueStatus(nextStatus || null);
          setQueueing(Boolean(nextStatus));
        },
      );
    },
    [isConnected, setQueueReplayOptions, setQueueStatus, setQueueing, socket, toast],
  );

  useEffect(() => {
    const handleQueueUpdate = (nextStatus: IQueueStatus) => {
      setQueueStatus((current) =>
        !current || current.requestId === nextStatus.requestId ? nextStatus : current,
      );
      setQueueing(true);
    };

    const handleMatchFound = (match: IQueueMatchFound) => {
      setMatchFound(true);
      sound.queue("menu0");
      setWaitSeconds(WAIT_BEFORE_START_SECONDS);

      const interval = setInterval(() => {
        sound.queue("back");
        setWaitSeconds((c) => c - 1);
      }, 1000);

      const timer = setTimeout(() => {
        sound.queue("shuffle");
        clearTimeout(interval);
        setQueueing(false);
        setQueueStatus(null);
        setQueueReplayOptions(null);
        setMatchFound(false);
        navigate(`/match/${match.matchSessionId}`);
      }, 1000 * WAIT_BEFORE_START_SECONDS );

      return () => {
        clearTimeout(interval);
        clearTimeout(timer);
      };
    };

    socket.on(EServerEvent.QUEUE_UPDATE, handleQueueUpdate);
    socket.on(EServerEvent.QUEUE_MATCH_FOUND, handleMatchFound);

    return () => {
      socket.off(EServerEvent.QUEUE_UPDATE, handleQueueUpdate);
      socket.off(EServerEvent.QUEUE_MATCH_FOUND, handleMatchFound);
    };
  }, [navigate, setQueueReplayOptions, setQueueStatus, setQueueing, socket]);

  return {
    status,
    matchFound,
    waitSeconds,
    isQueueing,
    joinQueue,
    leaveQueue,
  };
};
