import { useCallback, useEffect } from "react";
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

export const useMatchQueue = () => {
  const [
    { isConnected, isQueueing, queueStatus: status },
    { setQueueing, setQueueStatus, setQueueReplayOptions },
    socket,
  ] = useTrucoshi();
  const sound = useSound();
  const toast = useToast();
  const navigate = useNavigate();

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
      sound.queue("shuffle");
      setQueueing(false);
      setQueueStatus(null);
      setQueueReplayOptions(null);
      navigate(`/match/${match.matchSessionId}`);
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
    isQueueing,
    joinQueue,
    leaveQueue,
  };
};
