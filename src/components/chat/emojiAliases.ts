import type { EmojiOption } from "./ChatFieldShared";

const EMOJI_ALIASES = {
  "+1": "👍",
  "-1": "👎",
  "100": "💯",
  angry: "😠",
  argentina: "🇦🇷",
  boom: "💥",
  broken_heart: "💔",
  check: "✅",
  clap: "👏",
  clown: "🤡",
  cry: "😢",
  eyes: "👀",
  facepunch: "👊",
  fire: "🔥",
  flushed: "😳",
  grin: "😁",
  handshake: "🤝",
  heart: "❤️",
  heart_eyes: "😍",
  joy: "😂",
  kiss: "😘",
  laughing: "😆",
  mate: "🧉",
  medal: "🏅",
  muscle: "💪",
  neutral_face: "😐",
  ok_hand: "👌",
  poop: "💩",
  pray: "🙏",
  question: "❓",
  rage: "😡",
  rofl: "🤣",
  scream: "😱",
  smile: "😄",
  sob: "😭",
  sparkles: "✨",
  star: "⭐",
  sunglasses: "😎",
  sweat_smile: "😅",
  tada: "🎉",
  thinking: "🤔",
  thumbsdown: "👎",
  thumbsup: "👍",
  trophy: "🏆",
  upside_down: "🙃",
  warning: "⚠️",
  wave: "👋",
  wink: "😉",
  x: "❌",
} as const;

export const EMOJI_OPTIONS: EmojiOption[] = Object.entries(EMOJI_ALIASES).map(([label, emoji]) => ({
  label,
  emoji,
}));

export const replaceEmojiAliases = (message: string) =>
  message.replace(/:([+\-a-zA-Z0-9_]+):/g, (match, alias: string) => {
    return EMOJI_ALIASES[alias.toLowerCase() as keyof typeof EMOJI_ALIASES] || match;
  });
