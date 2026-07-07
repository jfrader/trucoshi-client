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
const TUTORIAL_MAX_CHARACTERS = 180;
const TUTORIAL_DURATION_MS = 9000;
const BUBBLE_TRANSITION_GAP_MS = 500;

const isTutorialChatMessage = (message: IChatMessage | null | undefined) =>
  Boolean((message as { tutorial?: boolean } | null | undefined)?.tutorial);

const getTutorialContext = (message: IChatMessage | null | undefined) =>
  (message as { tutorialContext?: string } | null | undefined)?.tutorialContext || null;

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
  const [, setQueuedMessages] = useState<IChatMessage[]>([]);
  const initializedRef = useRef(false);
  const latestSeenIdRef = useRef<IChatMessage["id"] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCoolingDownRef = useRef(false);
  const latestMessage = getLatestRegularChatMessage(room, player.key);
  const placementSx = getPlacementSx(placement);

  useEffect(() => {
    if (!latestMessage?.id) {
      return;
    }

    const isTutorial = isTutorialChatMessage(latestMessage);

    if (!initializedRef.current) {
      initializedRef.current = true;
      latestSeenIdRef.current = latestMessage.id;
      if (!isTutorial) {
        return;
      }
      setVisibleMessage(latestMessage);
      return;
    }

    if (latestSeenIdRef.current === latestMessage.id) {
      return;
    }

    latestSeenIdRef.current = latestMessage.id;
    if (
      isTutorial &&
      isTutorialChatMessage(visibleMessage) &&
      getTutorialContext(latestMessage) &&
      getTutorialContext(latestMessage) !== getTutorialContext(visibleMessage)
    ) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (gapTimerRef.current) {
        clearTimeout(gapTimerRef.current);
        gapTimerRef.current = null;
      }
      isCoolingDownRef.current = false;
      setQueuedMessages([]);
      setVisibleMessage(latestMessage);
      return;
    }
    if (visibleMessage || isCoolingDownRef.current) {
      setQueuedMessages((current) =>
        current.some((message) => message.id === latestMessage.id)
          ? current
          : [...current, latestMessage],
      );
      return;
    }

    setVisibleMessage(latestMessage);
  }, [latestMessage, visibleMessage]);

  useEffect(() => {
    if (!visibleMessage) {
      return;
    }

    const isTutorial = isTutorialChatMessage(visibleMessage);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    isCoolingDownRef.current = false;
    timerRef.current = setTimeout(() => {
      setVisibleMessage((current) => (current?.id === visibleMessage.id ? null : current));
      timerRef.current = null;
      isCoolingDownRef.current = true;
      gapTimerRef.current = setTimeout(() => {
        setQueuedMessages((current) => {
          const [nextMessage, ...rest] = current;
          setVisibleMessage(nextMessage || null);
          if (!nextMessage) {
            isCoolingDownRef.current = false;
          }
          return rest;
        });
        gapTimerRef.current = null;
      }, BUBBLE_TRANSITION_GAP_MS);
    }, isTutorial ? Math.max(durationMs, TUTORIAL_DURATION_MS) : durationMs);
  }, [durationMs, visibleMessage]);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (gapTimerRef.current) {
        clearTimeout(gapTimerRef.current);
      }
    },
    [],
  );

  if (!visibleMessage) {
    return null;
  }

  const fullText = visibleMessage.content.replace(/\s+/g, " ").trim();
  const isTutorial = isTutorialChatMessage(visibleMessage);
  const displayText = normalizeBubbleText(
    fullText,
    isTutorial ? TUTORIAL_MAX_CHARACTERS : maxCharacters,
  );

  return (
    <Box
      role="status"
      aria-label={`${player.name}: ${displayText}`}
      title={fullText}
      sx={(theme) => ({
        ml: 1,
        position: "absolute",
        zIndex: theme.zIndex.tooltip,
        width: isTutorial ? "min(26rem, calc(100vw - 1.35rem))" : undefined,
        maxWidth: isTutorial ? "calc(100vw - 1.35rem)" : compact ? "8rem" : "min(12rem, 52vw)",
        pointerEvents: "none",
        animation: "seatChatBubbleIn 160ms ease-out",
        ...theme.trucoshiUi.seatChatBubble.bubble,
        ...(isTutorial ? theme.trucoshiUi.seatChatBubble.tutorialBubble : {}),
        ...placementSx.bubble,
        [theme.breakpoints.up("sm")]: {
          width: isTutorial ? "26rem" : undefined,
          maxWidth: isTutorial ? "min(26rem, calc(100vw - 2rem))" : compact ? "9rem" : "13.5rem",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          display: "block",
          zIndex: -1,
          ...theme.trucoshiUi.seatChatBubble.tail,
          ...(isTutorial ? theme.trucoshiUi.seatChatBubble.tutorialTail : {}),
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
          textOverflow: isTutorial ? "clip" : "ellipsis",
          whiteSpace: isTutorial ? "normal" : "nowrap",
          fontSize: isTutorial ? "0.98rem" : compact ? "0.72rem" : "0.78rem",
          fontWeight: isTutorial ? 800 : 700,
          lineHeight: isTutorial ? 1.24 : 1.15,
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
};
