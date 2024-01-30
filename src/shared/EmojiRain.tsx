import { Box, styled } from "@mui/material";
import { fall, shake } from "../assets/animations/rain";
import { CSSProperties, memo } from "react";

const random = () => Math.random() * 8;

const emojis = [
  "🎉",
  "👏",
  "🙌",
  "🎉",
  "🎈",
  "🏆",
  "🎈",
  "😎",
  "🎉",
  "🥳",
  "🎈",
  "🏅",
  "🎉",
  "🎈",
  "🏆",
  "🏅",
  "🎊",
  "🎈",
  "🥂",
  "🎉",
  "🥳",
  "🎉",
  "👾",
  "🏆",
  "🥳",
  "🎈",
  "🏆",
  "🏅",
  "🎉",
  "🎈",
  "🤩",
  "🎈",
  "👾",
  "🎉",
  "🎈",
  "😎",
  "👾",
  "🗡️",
  "💰",
  "🌵",
  "🍷",
];

export const Emoji = styled("div")(() => {
  return {
    position: "fixed",
    top: "-10%",
    zIndex: 99999,
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    userSelect: "none",
    cursor: "default",
    animation: `${fall} 4.2s linear infinite, ${shake} 3s ease-in-out infinite`,
    animationPlayState: "running, running",
    animationDelay: `${(random() + "s", random() + "s")}`,
    left: `calc(var(--i) * ${Number(100 / emojis.length)}%)`,
  };
});

const C = () => {
  return (
    <Box fontSize="1.2rem">
      {emojis
        .sort(() => Math.random() - Math.random())
        .map((e, i) => (
          <Emoji key={i} style={{ "--i": i } as CSSProperties}>
            {e}
          </Emoji>
        ))}
    </Box>
  );
};

export const EmojiRain = memo(C, () => true);
