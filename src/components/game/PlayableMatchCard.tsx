import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { createPortal } from "react-dom";
import { PointerEvent, useEffect, useRef, useState } from "react";
import type { ICard } from "trucoshi";
import { GameCard } from "../card/GameCard";

type CardRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  sourceRect: CardRect;
  dragging: boolean;
};

type CardVisual = CardRect & {
  phase: "dragging" | "submitted" | "returning";
  animate: boolean;
};

type PlayableMatchCardProps = {
  card: ICard;
  cardIdx: number;
  canPlay: boolean;
  overlap: number;
  rotation: number;
  width: string;
  onPlayIntent: (card: ICard, cardIdx: number) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const containsPoint = (rect: DOMRect, x: number, y: number) =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

const readNaturalCardRect = (element: HTMLElement): CardRect => {
  const bounds = element.getBoundingClientRect();
  const width = element.offsetWidth || bounds.width;
  const height = element.offsetHeight || bounds.height;

  return {
    left: bounds.left + (bounds.width - width) / 2,
    top: bounds.top + (bounds.height - height) / 2,
    width,
    height,
  };
};

const readBoardRect = () =>
  document
    .querySelector<HTMLElement>('[data-truco-board-surface="true"]')
    ?.getBoundingClientRect() || null;

export const PlayableMatchCard = ({
  card,
  cardIdx,
  canPlay,
  overlap,
  rotation,
  width,
  onPlayIntent,
}: PlayableMatchCardProps) => {
  const theme = useTheme();
  const interaction = theme.trucoshiUi.match.cardPlayInteraction;
  const sessionRef = useRef<DragSession | null>(null);
  const submittedSourceRectRef = useRef<CardRect | null>(null);
  const observedInteractionLockRef = useRef(false);
  const suppressClickRef = useRef(false);
  const returnTimerRef = useRef<number | null>(null);
  const suppressClickTimerRef = useRef<number | null>(null);
  const [visual, setVisual] = useState<CardVisual | null>(null);
  const [dropCue, setDropCue] = useState<{ rect: CardRect; active: boolean } | null>(null);
  const [hideSource, setHideSource] = useState(false);

  const clearReturnTimer = () => {
    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
  };

  const clearVisual = () => {
    clearReturnTimer();
    submittedSourceRectRef.current = null;
    observedInteractionLockRef.current = false;
    setDropCue(null);
    setVisual(null);
    setHideSource(false);
  };

  const returnToSource = (sourceRect: CardRect) => {
    clearReturnTimer();
    setDropCue(null);
    setVisual((current) =>
      current
        ? {
            ...sourceRect,
            phase: "returning",
            animate: true,
          }
        : null,
    );

    returnTimerRef.current = window.setTimeout(() => {
      clearVisual();
    }, interaction.returnDurationMs + 60);
  };

  const requestTapPlay = () => {
    clearVisual();
    onPlayIntent(card, cardIdx);
  };

  const requestDraggedPlay = (sourceRect: CardRect, droppedRect: CardRect) => {
    clearReturnTimer();
    submittedSourceRectRef.current = sourceRect;
    observedInteractionLockRef.current = false;
    setDropCue(null);
    setHideSource(true);
    setVisual({
      ...droppedRect,
      phase: "submitted",
      animate: false,
    });
    onPlayIntent(card, cardIdx);
  };

  useEffect(() => {
    if (visual?.phase !== "submitted") {
      return;
    }

    if (!canPlay) {
      observedInteractionLockRef.current = true;
      return;
    }

    if (observedInteractionLockRef.current && submittedSourceRectRef.current) {
      const sourceRect = submittedSourceRectRef.current;
      clearReturnTimer();
      setDropCue(null);
      setVisual({
        ...sourceRect,
        phase: "returning",
        animate: true,
      });
      returnTimerRef.current = window.setTimeout(() => {
        returnTimerRef.current = null;
        submittedSourceRectRef.current = null;
        observedInteractionLockRef.current = false;
        setDropCue(null);
        setVisual(null);
        setHideSource(false);
      }, interaction.returnDurationMs + 60);
    }
  }, [canPlay, interaction.returnDurationMs, visual?.phase]);

  useEffect(
    () => () => {
      if (returnTimerRef.current !== null) {
        window.clearTimeout(returnTimerRef.current);
      }
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    },
    [],
  );

  const scheduleClickReset = () => {
    suppressClickRef.current = true;
    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
    }
    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!canPlay || event.button !== 0 || visual) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const sourceRect = readNaturalCardRect(event.currentTarget);
    const relativeX = bounds.width ? (event.clientX - bounds.left) / bounds.width : 0.5;
    const relativeY = bounds.height ? (event.clientY - bounds.top) / bounds.height : 0.5;

    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabX: clamp(relativeX, 0, 1) * sourceRect.width,
      grabY: clamp(relativeY, 0, 1) * sourceRect.height,
      sourceRect,
      dragging: false,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable in some embedded browsers; tap-to-play still works.
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);

    if (!session.dragging && distance < interaction.dragThresholdPx) {
      return;
    }

    event.preventDefault();
    session.dragging = true;
    const boardRect = readBoardRect();
    const active = Boolean(boardRect && containsPoint(boardRect, event.clientX, event.clientY));

    setHideSource(true);
    setVisual({
      left: event.clientX - session.grabX,
      top: event.clientY - session.grabY,
      width: session.sourceRect.width,
      height: session.sourceRect.height,
      phase: "dragging",
      animate: false,
    });
    setDropCue(
      boardRect
        ? {
            rect: {
              left: boardRect.left,
              top: boardRect.top,
              width: boardRect.width,
              height: boardRect.height,
            },
            active,
          }
        : null,
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    scheduleClickReset();
    const boardRect = readBoardRect();
    const droppedOnTable = Boolean(
      session.dragging && boardRect && containsPoint(boardRect, event.clientX, event.clientY),
    );

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // See the pointer-capture fallback in handlePointerDown.
    }

    if (!session.dragging) {
      requestTapPlay();
    } else if (droppedOnTable) {
      requestDraggedPlay(session.sourceRect, {
        left: event.clientX - session.grabX,
        top: event.clientY - session.grabY,
        width: session.sourceRect.width,
        height: session.sourceRect.height,
      });
    } else {
      returnToSource(session.sourceRect);
    }

    sessionRef.current = null;
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    scheduleClickReset();
    if (session.dragging) {
      returnToSource(session.sourceRect);
    }
    sessionRef.current = null;
  };

  const handleClick = () => {
    if (!canPlay || suppressClickRef.current || visual) {
      suppressClickRef.current = false;
      return;
    }

    requestTapPlay();
  };

  const handleVisualTransitionEnd = () => {
    if (visual?.phase === "returning") {
      clearVisual();
    }
  };

  const dragLayer =
    typeof document !== "undefined" && (visual || dropCue)
      ? createPortal(
          <>
            {dropCue ? (
              <Box
                aria-hidden="true"
                data-testid="card-drop-cue"
                sx={{
                  position: "fixed",
                  left: dropCue.rect.left,
                  top: dropCue.rect.top,
                  width: dropCue.rect.width,
                  height: dropCue.rect.height,
                  borderRadius: interaction.dropBorderRadius,
                  outline: dropCue.active ? interaction.activeDropOutline : interaction.dropOutline,
                  boxShadow: dropCue.active ? interaction.activeDropShadow : "none",
                  backgroundColor: dropCue.active
                    ? interaction.activeDropBackground
                    : "transparent",
                  transition: interaction.dropCueTransition,
                  pointerEvents: "none",
                  zIndex: theme.zIndex.modal - 3,
                }}
              />
            ) : null}
            {visual ? (
              <Box
                data-testid="card-play-drag-layer"
                onTransitionEnd={handleVisualTransitionEnd}
                sx={{
                  position: "fixed",
                  left: visual.left,
                  top: visual.top,
                  width: visual.width,
                  height: visual.height,
                  transform:
                    visual.phase === "dragging" ? `scale(${interaction.dragScale})` : "scale(1)",
                  transformOrigin: "center",
                  transition: visual.animate ? interaction.returnTransition : "none",
                  filter: visual.phase === "submitted" ? "none" : interaction.dragFilter,
                  pointerEvents: "none",
                  willChange: "left, top, width, height, transform",
                  zIndex: theme.zIndex.modal - 2,
                }}
              >
                <GameCard
                  card={card}
                  width="100%"
                  shadow
                  disableButton
                  sx={{ height: "100%" }}
                />
              </Box>
            ) : null}
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <Box
        className={canPlay ? "truco-play-card-interactive" : undefined}
        data-can-play={canPlay ? "true" : "false"}
        data-testid={`playable-match-card-${cardIdx}`}
        ml={overlap}
        sx={{
          transform: `rotate(${rotation}deg) translateY(${Math.abs(rotation) > 0 ? "2px" : "0"})`,
          transformOrigin: "bottom center",
          position: "relative",
          visibility: hideSource ? "hidden" : "visible",
          pointerEvents: hideSource ? "none" : "auto",
        }}
      >
        <GameCard
          card={card}
          width={width}
          shadow
          enableHover={canPlay && !hideSource}
          disabledMask={!canPlay}
          draggable={false}
          aria-grabbed={visual?.phase === "dragging"}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleClick}
          sx={{
            touchAction: canPlay ? "none" : "auto",
            userSelect: "none",
            cursor: canPlay ? (visual?.phase === "dragging" ? "grabbing" : "grab") : "default",
          }}
        />
      </Box>
      {dragLayer}
    </>
  );
};
