import { Favorite, Flag, GitHub, HelpOutlined, Telegram } from "@mui/icons-material";

export const GENERAL_LINKS = [
  {
    label: "donate",
    to: "https://geyser.fund/project/trucoshi",
    Icon: Favorite,
  },
  {
    label: "telegram",
    to: "https://t.me/trucoshi",
    Icon: Telegram,
  },
  {
    label: "github",
    to: "https://github.com/jfrader/trucoshi",
    Icon: GitHub,
  },
];

export const TOOLBAR_LINKS = [
  {
    label: "help",
    title: "Ayuda",
    to: "/help",
    Icon: HelpOutlined,
  },
];

export const HELP_LINKS = [
  {
    label: "Telegram",
    to: "https://t.me/trucoshi",
    Icon: Telegram,
  },
  {
    label: "Como jugar Truco",
    to: "https://www.nhfournier.es/como-jugar/truco/",
    Icon: Flag,
  },
  {
    label: "How to play Truco (english)",
    to: "https://www.nhfournier.es/en/como-jugar/truco/",
    Icon: Flag,
  },
];
