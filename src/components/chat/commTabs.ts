import { IChatMessage } from "trucoshi";

export type CommTabName = "all" | "chat" | "system";

export const FILTER_BY_TAB: Partial<Record<CommTabName, (message: IChatMessage) => boolean>> = {
  chat: (message) => !message.command && !message.system && !message.card,
  system: (message) => Boolean(message.command || message.system || message.card),
};

