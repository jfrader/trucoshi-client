import { useCallback, useContext, useEffect, useState } from "react";
import { EClientEvent, EServerEvent, IChatMessage, IPublicChatRoom } from "trucoshi";
import { TrucoshiContext } from "../context";

export const useChat = (
  matchId?: string,
  onMessage?: (message?: IChatMessage) => void
): [IPublicChatRoom | null, (message: string) => void, boolean] => {
  const context = useContext(TrucoshiContext);
  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const [room, setRoom] = useState<IPublicChatRoom | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { socket } = context;

  useEffect(() => {
    if (!matchId) {
      return;
    }

    if (!room) {
      socket.emit(EClientEvent.FETCH_CHAT_ROOM, matchId);
    }

    socket.on(EServerEvent.UPDATE_CHAT, (room) => {
      if (room.id === matchId) {
        setRoom(room);
      }
    });

    socket.on(EServerEvent.NEW_MESSAGE, (roomId, message) => {
      if (message && roomId === matchId) {
        setRoom((current) => {
          if (!current) return current;
          const newMessages = current ? [...current.messages] : [message];
          newMessages.push(message);
          return {
            ...current,
            messages: newMessages.sort((a, b) => {
              if (a.date < b.date) {
                return -1;
              }
              if (a.date > b.date) {
                return 1;
              }
              return 0;
            }),
          };
        });
        onMessage?.(message);
      }
    });

    return () => {
      socket.off(EServerEvent.UPDATE_CHAT);
      socket.off(EServerEvent.NEW_MESSAGE);
    };
  }, [matchId, onMessage, room, socket]);

  const chat = useCallback(
    (message: string) => {
      if (matchId && message && !isLoading) {
        setLoading(true);
        socket.emit(EClientEvent.CHAT, matchId, message, () => {
          setLoading(false);
        });
      }
    },
    [isLoading, matchId, socket]
  );

  return [room, chat, isLoading];
};
