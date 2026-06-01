import { useCallback, useEffect, useRef, useState } from "react";
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

export const useMatchQueue = () => {
  const [{ isConnected }, , socket] = useTrucoshi();
  const toast = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<IQueueStatus | null>(null);
  const [isQueueing, setQueueing] = useState(false);
  const isQueueingRef = useRef(false);

  useEffect(() => {
    isQueueingRef.current = isQueueing;
  }, [isQueueing]);

  const leaveQueue = useCallback(() => {
    if (!isQueueingRef.current) {
      setStatus(null);
      setQueueing(false);
      return;
    }

    socket.emit(EClientEvent.LEAVE_QUEUE, ({ error }) => {
      if (error) {
        toast.error(error.message || "No se pudo salir de la cola");
      }
    });
    isQueueingRef.current = false;
    setStatus(null);
    setQueueing(false);
  }, [socket, toast]);

  const joinQueue = useCallback(
    (options: IJoinQueueOptions) => {
      if (!isConnected) {
        toast.warning("Conectando con el servidor...");
        return;
      }

      setQueueing(true);
      socket.emit(EClientEvent.JOIN_QUEUE, options, ({ success, status: nextStatus, error }) => {
        if (!success) {
          setQueueing(false);
          setStatus(null);
          toast.error(error?.message || "No se pudo entrar a la cola");
          return;
        }

        setStatus(nextStatus || null);
        setQueueing(Boolean(nextStatus));
      });
    },
    [isConnected, socket, toast]
  );

  useEffect(() => {
    const handleQueueUpdate = (nextStatus: IQueueStatus) => {
      setStatus((current) =>
        !current || current.requestId === nextStatus.requestId ? nextStatus : current
      );
      setQueueing(true);
    };

    const handleMatchFound = (match: IQueueMatchFound) => {
      isQueueingRef.current = false;
      setQueueing(false);
      setStatus(null);
      navigate(`/match/${match.matchSessionId}`);
    };

    socket.on(EServerEvent.QUEUE_UPDATE, handleQueueUpdate);
    socket.on(EServerEvent.QUEUE_MATCH_FOUND, handleMatchFound);

    return () => {
      socket.off(EServerEvent.QUEUE_UPDATE, handleQueueUpdate);
      socket.off(EServerEvent.QUEUE_MATCH_FOUND, handleMatchFound);
      if (isQueueingRef.current) {
        socket.emit(EClientEvent.LEAVE_QUEUE, () => {});
        isQueueingRef.current = false;
      }
    };
  }, [navigate, socket]);

  return {
    status,
    isQueueing,
    joinQueue,
    leaveQueue,
  };
};
