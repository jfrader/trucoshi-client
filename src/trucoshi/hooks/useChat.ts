import { useCallback, useContext, useEffect, useState } from "react";
import { EClientEvent, EServerEvent } from "trucoshi";
import { IPublicChatRoom } from "trucoshi/dist/server/classes/Chat";
import { TrucoshiContext } from "../state/context";

export const useChat = (
  matchId?: string,
  onMessages?: (room: IPublicChatRoom) => void
): [IPublicChatRoom | null, (message: string) => void, boolean] => {
  const context = useContext(TrucoshiContext);
  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const [room, setRoom] = useState<IPublicChatRoom | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { socket } = context;

  useEffect(() => {
    socket.on(EServerEvent.UPDATE_CHAT, (room) => {
      setRoom(room);
    });
  }, [onMessages, socket]);

  useEffect(() => {
    if (room) {
      onMessages?.(room);
    }
  }, [onMessages, room]);

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
