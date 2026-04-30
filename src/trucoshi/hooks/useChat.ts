import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EClientEvent, EServerEvent, IChatMessage, IPublicChatRoom } from "trucoshi";
import { TrucoshiContext } from "../trucoshi.context";
import { useSound } from "../../sound/hooks/useSound";

function checkRoom(matchId: string, roomId: string) {
  return [matchId, matchId + 0, matchId + 1].includes(roomId);
}

export const useChat = (
  matchId?: string,
  onMessage?: (message?: IChatMessage) => void
): [IPublicChatRoom | null, (message: string) => void, boolean, IChatMessage | null] => {
  const context = useContext(TrucoshiContext);
  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  const [say, setSay] = useState<IChatMessage | null>(null);
  const [room, setRoom] = useState<IPublicChatRoom | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { queue, isPlayingQueueSoundRef } = useSound();
  const { socket } = context;
  const onMessageRef = useRef(onMessage);
  const isPlayingQueueSoundRefRef = useRef(isPlayingQueueSoundRef);

  onMessageRef.current = onMessage;
  isPlayingQueueSoundRefRef.current = isPlayingQueueSoundRef;

  useEffect(() => {
    if (!matchId || room) {
      return;
    }

    socket.emit(EClientEvent.FETCH_CHAT_ROOM, matchId);
  }, [matchId, room, socket]);

  useEffect(() => {
    if (!matchId) {
      return;
    }

    let timeout: NodeJS.Timeout | null = null;
    const handleUpdateChat = (nextRoom: IPublicChatRoom) => {
      if (checkRoom(matchId, nextRoom.id)) {
        setRoom((current) => {
          if (!current) {
            return nextRoom;
          }

          const currentLastMessageId = current.messages[current.messages.length - 1]?.id;
          const nextLastMessageId = nextRoom.messages[nextRoom.messages.length - 1]?.id;
          const sameMessageSequence =
            current.messages.length === nextRoom.messages.length &&
            currentLastMessageId === nextLastMessageId;

          return sameMessageSequence ? current : nextRoom;
        });
      }
    };

    const handleNewMessage = (roomId: string, message?: IChatMessage) => {
      if (!message || !checkRoom(matchId, roomId)) {
        return;
      }

      setRoom((current) => {
        if (!current) return current;

        if (message.sound) {
          const isPlaying = isPlayingQueueSoundRefRef.current.current === message.sound;

          if (message.user.key !== "system") {
            setSay(message);
            timeout && clearTimeout(timeout);
            timeout = setTimeout(() => setSay(null), 4000);
          }

          if (!isPlaying) {
            if (message.sound === "play") {
              const rndSound = Math.round(Math.random() * 2);
              queue("play" + rndSound);
            } else if (message.sound === "bot") {
              const rndSound = Math.round(Math.random() * 3);
              queue("bot" + rndSound);
            } else if (message.sound === "hit") {
              const rndSound = Math.round(Math.random() * 3);
              queue("hit" + rndSound);
            } else if (message.sound === "miss") {
              const rndSound = Math.round(Math.random() * 3);
              queue("miss" + rndSound);
            } else if (message.sound === "botvoice") {
              const rndSound = Math.round(Math.random() * 3);
              queue("botvoice" + rndSound);
            } else {
              queue(typeof message.sound === "string" ? message.sound : "chat");
            }
          }
        }

        if (message.hidden) {
          return current;
        }

        const incomingId = message.id;
        const exists = current.messages.some((existingMessage) => existingMessage.id === incomingId);

        if (exists) {
          return current;
        }

        const newMessages = [...current.messages, message];
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

      onMessageRef.current?.(message);
    };

    socket.on(EServerEvent.UPDATE_CHAT, handleUpdateChat);
    socket.on(EServerEvent.NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(EServerEvent.UPDATE_CHAT, handleUpdateChat);
      socket.off(EServerEvent.NEW_MESSAGE, handleNewMessage);
      timeout && clearTimeout(timeout);
    };
  }, [matchId, queue, socket]);

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

  return useMemo<[IPublicChatRoom | null, (message: string) => void, boolean, IChatMessage | null]>(
    () => [room, chat, isLoading, say],
    [chat, isLoading, room, say]
  );
};
