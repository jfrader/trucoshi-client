import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { IChatMessage, IPublicChatRoom, IPublicPlayer } from "trucoshi";

type SeatChatBubblePlacement = "top" | "bottom" | "left" | "right";

type SeatChatBubbleProps = {
  player: IPublicPlayer;
  room?: IPublicChatRoom | null;
  placement?: SeatChatBubblePlacement;
  maxCharacters?: number;
  durationMs?: number;
  compact?: boolean;
};

const DEFAULT_MAX_CHARACTERS = 64;
const DEFAULT_DURATION_MS = 3600;

export const getSeatChatBubblePlacement = ({
  cos,
  sin,
}: {
  cos: number;
  sin: number;
}): SeatChatBubblePlacement => {
  if (sin > 0.45) {
    return "top";
  }

  if (sin < -0.45) {
    return "bottom";
  }

  return cos > 0 ? "left" : "right";
};

const isRegularPlayerChatMessage = (message: IChatMessage, playerKey: string) =>
  message.user?.key === playerKey &&
  !message.system &&
  !message.hidden &&
  !message.command &&
  !message.card &&
  Boolean(message.content?.trim());

const getLatestRegularChatMessage = (room: IPublicChatRoom | null | undefined, playerKey: string) =>
  [...(room?.messages || [])]
    .reverse()
    .find((message) => isRegularPlayerChatMessage(message, playerKey)) || null;

const normalizeBubbleText = (content: string, maxCharacters: number) => {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxCharacters) {
    return normalized;
  }

  const sliceLength = Math.max(1, maxCharacters - 3);
  return `${normalized.slice(0, sliceLength).trimEnd()}...`;
};

const getPlacementSx = (placement: SeatChatBubblePlacement) => {
  if (placement === "bottom") {
    return {
      bubble: {
        top: "calc(100% + 0.42rem)",
        left: "50%",
        transform: "translateX(-50%)",
      },
      tail: {
        top: "-0.31rem",
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        borderRight: "none",
        borderBottom: "none",
      },
    };
  }

  if (placement === "left") {
    return {
      bubble: {
        right: "calc(100% + 0.5rem)",
        top: "50%",
        transform: "translateY(-50%)",
      },
      tail: {
        right: "-0.31rem",
        top: "50%",
        transform: "translateY(-50%) rotate(45deg)",
        borderLeft: "none",
        borderBottom: "none",
      },
    };
  }

  if (placement === "right") {
    return {
      bubble: {
        left: "calc(100% + 0.5rem)",
        top: "50%",
        transform: "translateY(-50%)",
      },
      tail: {
        left: "-0.31rem",
        top: "50%",
        transform: "translateY(-50%) rotate(45deg)",
        borderRight: "none",
        borderTop: "none",
      },
    };
  }

  return {
    bubble: {
      bottom: "calc(100% + 0.42rem)",
      left: "50%",
      transform: "translateX(-50%)",
    },
    tail: {
      bottom: "-0.31rem",
      left: "50%",
      transform: "translateX(-50%) rotate(45deg)",
      borderLeft: "none",
      borderTop: "none",
    },
  };
};

export const SeatChatBubble = ({
  player,
  room,
  placement = "top",
  maxCharacters = DEFAULT_MAX_CHARACTERS,
  durationMs = DEFAULT_DURATION_MS,
  compact,
}: SeatChatBubbleProps) => {
  const [visibleMessage, setVisibleMessage] = useState<IChatMessage | null>(null);
  const initializedRef = useRef(false);
  const latestSeenIdRef = useRef<IChatMessage["id"] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestMessage = getLatestRegularChatMessage(room, player.key);
  const placementSx = getPlacementSx(placement);

  useEffect(() => {
    if (!latestMessage?.id) {
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      latestSeenIdRef.current = latestMessage.id;
      return;
    }

    if (latestSeenIdRef.current === latestMessage.id) {
      return;
    }

    latestSeenIdRef.current = latestMessage.id;
    setVisibleMessage(latestMessage);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setVisibleMessage((current) => (current?.id === latestMessage.id ? null : current));
      timerRef.current = null;
    }, durationMs);
  }, [durationMs, latestMessage]);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  if (!visibleMessage) {
    return null;
  }

  const fullText = visibleMessage.content.replace(/\s+/g, " ").trim();
  const displayText = normalizeBubbleText(fullText, maxCharacters);

  return (
    <Box
      role="status"
      aria-label={`${player.name}: ${displayText}`}
      title={fullText}
      sx={(theme) => ({
        position: "absolute",
        zIndex: theme.zIndex.tooltip,
        maxWidth: compact ? "8rem" : "min(12rem, 52vw)",
        pointerEvents: "none",
        animation: "seatChatBubbleIn 160ms ease-out",
        ...theme.trucoshiUi.seatChatBubble.bubble,
        ...placementSx.bubble,
        [theme.breakpoints.up("sm")]: {
          maxWidth: compact ? "9rem" : "13.5rem",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          display: "block",
          zIndex: -1,
          ...theme.trucoshiUi.seatChatBubble.tail,
          ...placementSx.tail,
        },
        "@keyframes seatChatBubbleIn": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
      })}
    >
      <Typography
        component="span"
        sx={{
          display: "block",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: compact ? "0.72rem" : "0.78rem",
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
};
