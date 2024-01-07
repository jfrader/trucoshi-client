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
    socket.on(EServerEvent.UPDATE_CHAT, (room, message) => {
      if (room.id === matchId) {
        setRoom(room);
        onMessage?.(message);
      }
    });

    return () => {
      socket.off(EServerEvent.UPDATE_CHAT);
    };
  }, [matchId, onMessage, socket]);

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
