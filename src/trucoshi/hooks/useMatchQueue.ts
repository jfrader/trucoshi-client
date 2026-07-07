import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EClientEvent,
  EServerEvent,
  IJoinQueueOptions,
  IQueueMatchCancelled,
  IQueueMatchFound,
  IQueueMatchStarting,
  IQueueReadyUpdate,
  IQueueStatus,
} from "trucoshi";
import { useToast } from "../../hooks/useToast";
import { useTrucoshi } from "./useTrucoshi";
import { useSound } from "../../sound/hooks/useSound";

export type MatchQueuePlayerCount = 0 | IJoinQueueOptions["maxPlayers"];
export type JoinMatchQueueOptions = Omit<IJoinQueueOptions, "maxPlayers"> & {
  maxPlayers: MatchQueuePlayerCount;
};

type UseMatchQueueOptions = {
  listen?: boolean;
};

const getNotificationPermission = (): NotificationPermission | "unsupported" => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
};

const getRemainingSeconds = (targetTime: number | null, serverAheadTime: number) => {
  if (!targetTime) {
    return 0;
  }

  return Math.max(Math.ceil((targetTime - (Date.now() + serverAheadTime)) / 1000), 0);
};

export const useMatchQueue = ({ listen = false }: UseMatchQueueOptions = {}) => {
  const [
    { account, session, isConnected, isQueueing, queueStatus: status, serverAheadTime },
    { setQueueing, setQueueStatus, setQueueReplayOptions },
    socket,
  ] = useTrucoshi();
  const sound = useSound();
  const toast = useToast();
  const navigate = useNavigate();
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const [queueProposal, setQueueProposal] = useState<IQueueMatchFound | null>(null);
  const [startingAt, setStartingAt] = useState<number | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);

  const clearCountdownTimers = useCallback(() => {
    if (countdownTimer.current) {
      clearTimeout(countdownTimer.current);
      countdownTimer.current = null;
    }

    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, []);

  const notifyMatchFound = useCallback(() => {
    if (getNotificationPermission() !== "granted") {
      return;
    }

    new Notification("Partida encontrada", {
      body: "Tus rivales estan esperando confirmacion.",
      icon: "/favicon.ico",
    });
  }, []);

  const requestNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      toast.warning("Este navegador no soporta notificaciones");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      toast.success("Notificaciones activadas");
    }
  }, [toast]);

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
  }, [isQueueing, setQueueStatus, setQueueing, socket, sound, toast]);

  const joinQueue = useCallback(
    (options: JoinMatchQueueOptions) => {
      if (!isConnected) {
        toast.warning("Conectando con el servidor...");
        return;
      }

      if (notificationPermission === "default") {
        void requestNotifications();
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
    [
      isConnected,
      notificationPermission,
      requestNotifications,
      setQueueReplayOptions,
      setQueueStatus,
      setQueueing,
      socket,
      sound,
      toast,
    ],
  );

  const confirmQueueMatch = useCallback(() => {
    if (!queueProposal) {
      return;
    }

    socket.emit(EClientEvent.CONFIRM_QUEUE_MATCH, queueProposal.proposalId, ({ error, update }) => {
      if (error) {
        toast.error(error.message || "No se pudo confirmar la partida");
        return;
      }

      if (update) {
        setQueueProposal((current) => (current ? { ...current, ...update } : current));
      }
      sound.queue("menu1");
    });
  }, [queueProposal, socket, sound, toast]);

  const declineQueueMatch = useCallback(() => {
    if (!queueProposal) {
      return;
    }

    socket.emit(EClientEvent.DECLINE_QUEUE_MATCH, queueProposal.proposalId, ({ error }) => {
      if (error) {
        toast.error(error.message || "No se pudo cancelar la partida");
      }
    });
  }, [queueProposal, socket, toast]);

  useEffect(() => {
    if (!listen) {
      return;
    }

    const handleQueueUpdate = (nextStatus: IQueueStatus) => {
      setQueueStatus((current) =>
        !current || current.requestId === nextStatus.requestId ? nextStatus : current,
      );
      setQueueing(true);
    };

    const handleMatchFound = (match: IQueueMatchFound) => {
      clearCountdownTimers();
      setQueueProposal(match);
      setStartingAt(null);
      setWaitSeconds(getRemainingSeconds(match.readyExpiresAt, serverAheadTime));
      setQueueing(false);
      setQueueStatus(null);
      setQueueReplayOptions(null);
      sound.queue("menu0");
      notifyMatchFound();
    };

    const handleReadyUpdate = (update: IQueueReadyUpdate) => {
      setQueueProposal((current) =>
        current && current.proposalId === update.proposalId ? { ...current, ...update } : current,
      );
    };

    const handleStarting = (starting: IQueueMatchStarting) => {
      setStartingAt(starting.startsAt);
      setWaitSeconds(getRemainingSeconds(starting.startsAt, serverAheadTime));
      sound.queue("shuffle");

      clearCountdownTimers();
      countdownInterval.current = setInterval(() => {
        const remaining = getRemainingSeconds(starting.startsAt, serverAheadTime);
        setWaitSeconds(remaining);
        if (remaining > 0) {
          sound.queue("back");
        }
      }, 1000);

      countdownTimer.current = setTimeout(() => {
        clearCountdownTimers();
        setQueueProposal(null);
        setStartingAt(null);
        navigate(`/match/${starting.matchSessionId}`);
      }, Math.max(starting.startsAt - (Date.now() + serverAheadTime), 0));
    };

    const handleCancelled = (cancelled: IQueueMatchCancelled) => {
      clearCountdownTimers();
      setQueueProposal((current) =>
        current?.proposalId === cancelled.proposalId ? null : current,
      );
      setStartingAt(null);
      setWaitSeconds(0);
      sound.queue("back");

      if (cancelled.reason === "timeout") {
        toast.warning("Uno o mas jugadores no confirmaron a tiempo");
      }
    };

    socket.on(EServerEvent.QUEUE_UPDATE, handleQueueUpdate);
    socket.on(EServerEvent.QUEUE_MATCH_FOUND, handleMatchFound);
    socket.on(EServerEvent.QUEUE_READY_UPDATE, handleReadyUpdate);
    socket.on(EServerEvent.QUEUE_MATCH_STARTING, handleStarting);
    socket.on(EServerEvent.QUEUE_MATCH_CANCELLED, handleCancelled);

    return () => {
      clearCountdownTimers();
      socket.off(EServerEvent.QUEUE_UPDATE, handleQueueUpdate);
      socket.off(EServerEvent.QUEUE_MATCH_FOUND, handleMatchFound);
      socket.off(EServerEvent.QUEUE_READY_UPDATE, handleReadyUpdate);
      socket.off(EServerEvent.QUEUE_MATCH_STARTING, handleStarting);
      socket.off(EServerEvent.QUEUE_MATCH_CANCELLED, handleCancelled);
    };
  }, [
    clearCountdownTimers,
    listen,
    navigate,
    notifyMatchFound,
    serverAheadTime,
    setQueueReplayOptions,
    setQueueStatus,
    setQueueing,
    socket,
    sound,
    toast,
  ]);

  useEffect(() => {
    if (!queueProposal || startingAt) {
      return;
    }

    setWaitSeconds(getRemainingSeconds(queueProposal.readyExpiresAt, serverAheadTime));
    const interval = setInterval(() => {
      setWaitSeconds(getRemainingSeconds(queueProposal.readyExpiresAt, serverAheadTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [queueProposal, serverAheadTime, startingAt]);

  const isQueueReadyConfirmed = Boolean(
    queueProposal?.participants.some(
      (participant) =>
        participant.ready &&
        ((account?.id && participant.accountId === account.id) ||
          (!account?.id && participant.session === session)),
    ),
  );

  return {
    status,
    queueProposal,
    matchFound: Boolean(queueProposal),
    isQueueStarting: Boolean(startingAt),
    isQueueReadyConfirmed,
    waitSeconds,
    notificationPermission,
    isQueueing,
    joinQueue,
    leaveQueue,
    confirmQueueMatch,
    declineQueueMatch,
    requestNotifications,
  };
};
