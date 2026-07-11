import { Close, EmojiEvents } from "@mui/icons-material";
import { CircularProgress, Typography } from "@mui/material";
import { ITreasureOpenResult } from "trucoshi";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatedChestFrame,
  LightBurst,
  LoadingState,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayRoot,
  PrimaryTreasureButton,
  Stage,
  StageGlow,
  StartActionWrap,
} from "./TreasureChestPanel.styles";
import {
  CHEST_ANIMATION_MS,
  CHEST_FRAME_COUNT,
  CHEST_FRAME_PAUSE_MS,
  CHEST_FRAME_STEP_MS,
  ChestFrame,
} from "./TreasureChestSprite";
import { TreasureEmptyReward, TreasureSkinReward } from "./TreasureReward";
import { getRewardSound } from "./treasureResult";
import { useTreasureSound } from "./useTreasureSound";

const REWARD_AUTO_REVEAL_MS = 1000;

type QueueSound = ReturnType<typeof useTreasureSound>["queue"];

const useChestFrameAnimation = ({
  open,
  started,
  chestId,
}: {
  open: boolean;
  started: boolean;
  chestId: number | null;
}) => {
  const [frame, setFrame] = useState(0);
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    if (!open || !started) {
      setFrame(0);
      setChestOpen(false);
      return;
    }

    setFrame(0);
    setChestOpen(false);

    const timers = Array.from({ length: CHEST_FRAME_COUNT - 1 }, (_, index) =>
      window.setTimeout(
        () => setFrame(index + 1),
        CHEST_FRAME_PAUSE_MS + CHEST_FRAME_STEP_MS * index,
      ),
    );

    timers.push(
      window.setTimeout(() => {
        setChestOpen(true);
      }, CHEST_ANIMATION_MS),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [open, started, chestId]);

  return { frame, chestOpen };
};

const useRewardPresentation = ({
  open,
  canShowReward,
  sceneResult,
  queue,
}: {
  open: boolean;
  canShowReward: boolean;
  sceneResult: ITreasureOpenResult | null;
  queue: QueueSound;
}) => {
  const [rewardPresented, setRewardPresented] = useState(false);
  const [rewardRevealed, setRewardRevealed] = useState(false);
  const chestOpenSoundKey = useRef<string | null>(null);
  const rewardSoundKey = useRef<string | null>(null);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    if (!open || !canShowReward) {
      return;
    }

    setRewardPresented(false);
    setRewardRevealed(false);

    const rewardTimer = window.setTimeout(() => {
      setRewardPresented(true);
    }, 90);

    return () => {
      window.clearTimeout(rewardTimer);
    };
  }, [canShowReward, open, sceneResult?.chestId, sceneResult?.cardSkin?.id]);

  useEffect(() => {
    if (!open || !rewardPresented || !sceneResult) {
      return;
    }

    const soundKey = `${sceneResult.chestId}:${sceneResult.cardSkin?.id || "empty"}`;
    if (rewardSoundKey.current === soundKey) {
      return;
    }

    rewardSoundKey.current = soundKey;
    queueRef.current(getRewardSound(sceneResult));
  }, [open, rewardPresented, sceneResult]);

  useEffect(() => {
    if (!open || !rewardPresented || rewardRevealed || !sceneResult?.cardSkin) {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setRewardRevealed(true);
    }, REWARD_AUTO_REVEAL_MS);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, [open, rewardPresented, rewardRevealed, sceneResult?.cardSkin]);

  useEffect(() => {
    if (!open || !sceneResult) {
      setRewardPresented(false);
      setRewardRevealed(false);
      chestOpenSoundKey.current = null;
      rewardSoundKey.current = null;
    }
  }, [open, sceneResult]);

  return {
    rewardPresented,
    rewardRevealed,
    revealReward: () => setRewardRevealed(true),
  };
};

const StartOpeningPrompt = ({
  opening,
  onStartOpen,
}: {
  opening: boolean;
  onStartOpen: () => void;
}) => (
  <StartActionWrap>
    <PrimaryTreasureButton
      color="warning"
      data-testid="start-treasure-opening"
      disabled={opening}
      onClick={onStartOpen}
      size="large"
      startIcon={opening ? <CircularProgress size={17} color="inherit" /> : <EmojiEvents />}
      variant="contained"
      fullWidth
    >
      Abrir cofre
    </PrimaryTreasureButton>
  </StartActionWrap>
);

const OpeningLoadingState = () => (
  <LoadingState>
    <CircularProgress color="warning" size={26} />
    <Typography variant="body2" color="text.secondary" fontWeight={800}>
      Abriendo cofre...
    </Typography>
  </LoadingState>
);

const RewardScene = ({
  result,
  rewardPresented,
  rewardRevealed,
  onReveal,
}: {
  result: ITreasureOpenResult;
  rewardPresented: boolean;
  rewardRevealed: boolean;
  onReveal: () => void;
}) =>
  result.cardSkin ? (
    <TreasureSkinReward
      result={result}
      rewardPresented={rewardPresented}
      rewardRevealed={rewardRevealed}
      onReveal={onReveal}
    />
  ) : (
    <TreasureEmptyReward result={result} rewardPresented={rewardPresented} />
  );

const TreasureStage = ({
  started,
  opening,
  frame,
  chestOpen,
  canShowReward,
  sceneResult,
  rewardPresented,
  rewardRevealed,
  onReveal,
  onStartOpen,
}: {
  started: boolean;
  opening: boolean;
  frame: number;
  chestOpen: boolean;
  canShowReward: boolean;
  sceneResult: ITreasureOpenResult | null;
  rewardPresented: boolean;
  rewardRevealed: boolean;
  onReveal: () => void;
  onStartOpen: () => void;
}) => (
  <Stage data-testid="treasure-stage">
    <StageGlow started={started} canShowReward={canShowReward} />
    <AnimatedChestFrame
      data-frame={frame}
      data-testid="treasure-chest-frame"
      started={started}
      canShowReward={canShowReward}
      frame={frame}
      chestOpen={chestOpen}
    >
      <ChestFrame frame={frame} />
    </AnimatedChestFrame>
    <LightBurst
      aria-hidden
      data-active={canShowReward ? "true" : "false"}
      data-testid="treasure-light-burst"
      active={canShowReward}
    />
    {!started ? (
      <StartOpeningPrompt opening={opening} onStartOpen={onStartOpen} />
    ) : canShowReward && sceneResult ? (
      <RewardScene
        result={sceneResult}
        rewardPresented={rewardPresented}
        rewardRevealed={rewardRevealed}
        onReveal={onReveal}
      />
    ) : (
      <OpeningLoadingState />
    )}
  </Stage>
);

export const TreasureOpeningOverlay = ({
  open,
  opening,
  result,
  chestId,
  onClose,
  started = true,
  onStartOpen,
}: {
  open: boolean;
  opening: boolean;
  result: ITreasureOpenResult | null;
  chestId: number | null;
  onClose: () => void;
  started?: boolean;
  onStartOpen?: () => void;
}) => {
  const { queue } = useTreasureSound();
  const animationSoundKey = useRef<string | null>(null);
  const sceneResult = result && result.chestId === chestId ? result : null;
  const { frame, chestOpen } = useChestFrameAnimation({ open, started, chestId });
  const canShowReward = Boolean(started && sceneResult && chestOpen);
  const showClose = Boolean(!started || sceneResult || (!opening && !sceneResult));
  const { rewardPresented, rewardRevealed, revealReward } = useRewardPresentation({
    open,
    canShowReward,
    sceneResult,
    queue,
  });

  useEffect(() => {
    if (!open || !started) {
      animationSoundKey.current = null;
      return;
    }

    const soundKey = String(chestId || "none");
    if (animationSoundKey.current !== soundKey) {
      animationSoundKey.current = soundKey;
      queue("shuffle");
    }
  }, [open, started, chestId, queue]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleStartOpen = () => {
    onStartOpen?.();
  };

  return createPortal(
    <OverlayRoot data-testid="treasure-opening-overlay" data-trucoshi-overlay="open">
      <OverlayHeader>
        {showClose ? (
          <OverlayCloseButton aria-label="Cerrar cofre" onClick={onClose}>
            <Close />
          </OverlayCloseButton>
        ) : null}
      </OverlayHeader>

      <TreasureStage
        started={started}
        opening={opening}
        frame={frame}
        chestOpen={chestOpen}
        canShowReward={canShowReward}
        sceneResult={sceneResult}
        rewardPresented={rewardPresented}
        rewardRevealed={rewardRevealed}
        onReveal={revealReward}
        onStartOpen={handleStartOpen}
      />

      <OverlayFooter>
        {sceneResult ? (
          <PrimaryTreasureButton
            color="warning"
            data-testid="treasure-done-button"
            onClick={onClose}
            variant="contained"
          >
            Listo
          </PrimaryTreasureButton>
        ) : null}
      </OverlayFooter>
    </OverlayRoot>,
    document.body,
  );
};
