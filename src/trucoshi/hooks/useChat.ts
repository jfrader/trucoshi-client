import { useCallback, useContext, useEffect, useState } from "react";
import { EClientEvent, EServerEvent, IChatMessage, IPublicChatRoom } from "trucoshi";
import { TrucoshiContext } from "../context";
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

  useEffect(() => {
    if (!matchId) {
      return;
    }

    if (!room) {
      socket.emit(EClientEvent.FETCH_CHAT_ROOM, matchId);
    }

    let timeout: NodeJS.Timeout | null = null;

    socket.on(EServerEvent.UPDATE_CHAT, (room) => {
      if (checkRoom(matchId, room.id)) {
        setRoom(room);
      }
    });

    socket.on(EServerEvent.NEW_MESSAGE, (roomId, message) => {
      if (message && checkRoom(matchId, roomId)) {
        setRoom((current) => {
          if (!current) return current;

          if (message.sound) {
            const isPlaying = isPlayingQueueSoundRef.current === message.sound;

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

          const newMessages = current ? [...current.messages] : [];
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
  }, [isPlayingQueueSoundRef, matchId, onMessage, queue, room, socket]);

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

  return [room, chat, isLoading, say];
};
