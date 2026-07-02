import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AutoAwesome, Close, EmojiEvents, Inventory2 } from "@mui/icons-material";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ITreasureOpenResult, ITreasureStatus } from "trucoshi";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GameCard } from "../card/GameCard";
import chestSprite from "../../assets/treasure/chest-opening-spritesheet.png";
import { useSound } from "../../sound/hooks/useSound";

const rarityLabel: Record<string, string> = {
  COMMON: "Comun",
  RARE: "Rara",
  EPIC: "Epica",
  LEGENDARY: "Legendaria",
  PROMO: "Promo",
};

const CHEST_FRAME_COUNT = 8;
const CHEST_FRAME_PAUSE_MS = 180;
const CHEST_FRAME_STEP_MS = 110;
const CHEST_ANIMATION_MS = CHEST_FRAME_PAUSE_MS + CHEST_FRAME_STEP_MS * (CHEST_FRAME_COUNT - 1);
const REWARD_RISE_MS = 520;
const REWARD_AUTO_REVEAL_MS = 1000;
const REWARD_CARD_WIDTH = "var(--treasure-reward-card-width)";

type TreasureOpenHandler = (chestId: number) => Promise<boolean> | boolean | void;
type TreasureDevGrantHandler = () => Promise<boolean> | boolean | void;
type TreasureEquipRewardHandler = (
  cardSkin: NonNullable<ITreasureOpenResult["cardSkin"]>,
) => Promise<boolean> | boolean | void;

const getResultTitle = (result: ITreasureOpenResult) =>
  result.granted ? "Nueva skin" : result.duplicate ? "Repetida" : "Sin premio";

const getResultDescription = (result: ITreasureOpenResult) =>
  result.cardSkin
    ? `${CARDS_HUMAN_READABLE[result.cardSkin.card]} - ${
        rarityLabel[result.cardSkin.rarity] || result.cardSkin.rarity
      }`
    : result.rarity
      ? rarityLabel[result.rarity] || result.rarity
      : "No hubo una skin disponible";

const getResultRarity = (result: ITreasureOpenResult) =>
  result.cardSkin?.rarity || result.rarity || null;

const getResultCardLabel = (result: ITreasureOpenResult) =>
  result.cardSkin ? CARDS_HUMAN_READABLE[result.cardSkin.card] || result.cardSkin.card : null;

const getResultDismissKey = (result: ITreasureOpenResult) =>
  `${result.chestId}:${result.cardSkin?.id || "empty"}:${result.granted ? "granted" : "not-granted"}:${
    result.duplicate ? "duplicate" : "unique"
  }`;

const getRewardSound = (result: ITreasureOpenResult) => {
  if (!result.cardSkin) {
    return "back";
  }

  return result.duplicate ? "ceba_toma_mate" : "winner";
};

const TreasureRarityBadge = ({
  rarity,
  size = "compact",
}: {
  rarity: string | null;
  size?: "compact" | "large";
}) => {
  if (!rarity) {
    return null;
  }

  return (
    <Box
      component="span"
      data-rarity={rarity}
      data-testid={`treasure-rarity-${rarity}`}
      sx={(theme) => ({
        ...(theme.trucoshiUi.treasure.rarityStyles[rarity] ||
          theme.trucoshiUi.treasure.rarityStyles.COMMON),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: size === "large" ? { xs: "1.75rem", sm: "1.95rem" } : "1.35rem",
        px: size === "large" ? { xs: 1.1, sm: 1.3 } : 0.8,
        py: size === "large" ? 0.28 : 0.16,
        borderRadius: "999px",
        fontSize: size === "large" ? { xs: "0.98rem", sm: "1.08rem" } : "0.78rem",
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      })}
    >
      {rarityLabel[rarity] || rarity}
    </Box>
  );
};

const TreasureResultSummary = ({
  result,
  size = "compact",
}: {
  result: ITreasureOpenResult;
  size?: "compact" | "large";
}) => {
  const cardLabel = getResultCardLabel(result);
  const rarity = getResultRarity(result);

  if (!cardLabel && !rarity) {
    return (
      <Typography
        variant={size === "large" ? "body1" : "body2"}
        color="text.secondary"
        fontWeight={850}
      >
        {getResultDescription(result)}
      </Typography>
    );
  }

  return (
    <Stack
      data-testid="treasure-result-summary"
      direction="row"
      alignItems="center"
      justifyContent={size === "large" ? "center" : "flex-start"}
      gap={size === "large" ? 0.75 : 0.55}
      flexWrap="wrap"
      minWidth={0}
    >
      <Typography
        component="span"
        data-testid="treasure-result-title"
        color={size === "large" ? "warning.light" : "text.primary"}
        fontWeight={950}
        sx={{
          fontSize:
            size === "large" ? { xs: "1.12rem", sm: "1.3rem" } : { xs: "0.92rem", lg: "1rem" },
          lineHeight: 1.05,
          textShadow: "0 0 12px rgba(255,193,55,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        {getResultTitle(result)}
      </Typography>
      {cardLabel ? (
        <Typography
          component="span"
          color="text.secondary"
          fontWeight={900}
          sx={{
            fontSize:
              size === "large" ? { xs: "1rem", sm: "1.12rem" } : { xs: "0.86rem", lg: "0.95rem" },
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          {cardLabel}
        </Typography>
      ) : null}
      <TreasureRarityBadge rarity={rarity} size={size} />
    </Stack>
  );
};

const getFramePosition = (frame: number) =>
  `${(Math.min(Math.max(frame, 0), CHEST_FRAME_COUNT - 1) / (CHEST_FRAME_COUNT - 1)) * 100}% 0`;

const ChestFrame = ({
  frame,
  size = "min(78vw, 23rem)",
  mini = false,
}: {
  frame: number;
  size?: string;
  mini?: boolean;
}) => (
  <Box
    aria-hidden
    data-frame={frame}
    data-testid={mini ? "treasure-mini-chest" : "treasure-chest-sprite"}
    sx={(theme) => ({
      width: size,
      aspectRatio: "1 / 1",
      backgroundImage: `url(${chestSprite})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${CHEST_FRAME_COUNT * 100}% 100%`,
      backgroundPosition: getFramePosition(frame),
      filter: mini
        ? "drop-shadow(0 6px 8px rgba(0,0,0,0.35))"
        : theme.trucoshiUi.treasure.chestShadow,
      transformOrigin: "50% 82%",
      transition: mini ? "none" : "transform 90ms ease-out",
    })}
  />
);

const TreasureRewardCard = ({
  result,
  revealed,
  canReveal,
  onReveal,
}: {
  result: NonNullable<ITreasureOpenResult["cardSkin"]>;
  revealed: boolean;
  canReveal: boolean;
  onReveal: () => void;
}) => (
  <ButtonBase
    aria-label={revealed ? "Skin revelada" : "Revelar skin"}
    data-card-scale="inspect"
    data-flipped={revealed ? "true" : "false"}
    data-reveal-ready={canReveal ? "true" : "false"}
    data-testid="treasure-reward-card"
    disabled={!canReveal}
    onClick={() => canReveal && onReveal()}
    sx={{
      "--treasure-reward-card-width": "clamp(11.5rem, min(58vw, 38dvh), 17rem)",
      width: REWARD_CARD_WIDTH,
      height: `calc(${REWARD_CARD_WIDTH} * 1.48)`,
      borderRadius: `calc(${REWARD_CARD_WIDTH} / 13)`,
      cursor: canReveal && !revealed ? "pointer" : "default",
      overflow: "visible",
      p: 0,
      perspective: "48rem",
      transition: "filter 180ms ease, transform 180ms ease",
      filter: canReveal ? "none" : "brightness(0.82) saturate(0.9)",
      "&:focus-visible": {
        outline: "2px solid",
        outlineColor: "warning.main",
        outlineOffset: 6,
      },
    }}
  >
    <Box
      sx={(theme) => ({
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transition: theme.transitions.create("transform", {
          duration: theme.transitions.duration.standard,
          easing: theme.transitions.easing.easeInOut,
        }),
        transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
      })}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
        }}
      >
        <GameCard
          card={BURNT_CARD}
          displayMode="default"
          disableButton
          shadow
          width={REWARD_CARD_WIDTH}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <GameCard
          card={result.card}
          cardSkinId={result.id}
          displayMode="skins"
          disableButton
          shadow
          width={REWARD_CARD_WIDTH}
        />
      </Box>
    </Box>
  </ButtonBase>
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
  const { queue } = useSound();
  const [frame, setFrame] = useState(0);
  const [chestOpen, setChestOpen] = useState(false);
  const [rewardPresented, setRewardPresented] = useState(false);
  const [rewardRevealed, setRewardRevealed] = useState(false);
  const chestOpenSoundKey = useRef<string | null>(null);
  const rewardSoundKey = useRef<string | null>(null);
  const queueRef = useRef(queue);
  const sceneResult = result && result.chestId === chestId ? result : null;
  const canShowReward = Boolean(started && sceneResult && chestOpen);
  const showClose = Boolean(!started || sceneResult || (!opening && !sceneResult));

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !started) {
      setFrame(0);
      setChestOpen(false);
      setRewardPresented(false);
      setRewardRevealed(false);
      return;
    }

    setFrame(0);
    setChestOpen(false);
    setRewardPresented(false);
    setRewardRevealed(false);
    chestOpenSoundKey.current = null;
    rewardSoundKey.current = null;

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

  useEffect(() => {
    if (!open || !canShowReward) {
      return;
    }

    const soundKey = `${sceneResult?.chestId}:${sceneResult?.cardSkin?.id || "empty"}`;
    if (chestOpenSoundKey.current !== soundKey) {
      chestOpenSoundKey.current = soundKey;
      queueRef.current("play");
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

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleStartOpen = () => {
    queue("menu0");
    onStartOpen?.();
  };

  return createPortal(
    <Box
      data-testid="treasure-opening-overlay"
      sx={(theme) => ({
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: theme.zIndex.tooltip + 20,
        color: "text.primary",
        overflow: "hidden",
        background: theme.trucoshiUi.treasure.overlayBackground,
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr) auto",
        px: { xs: 1, sm: 2 },
        pt: {
          xs: "calc(env(safe-area-inset-top) + 0.75rem)",
          sm: "calc(env(safe-area-inset-top) + 1.1rem)",
        },
        pb: {
          xs: "calc(env(safe-area-inset-bottom) + 1rem)",
          sm: "calc(env(safe-area-inset-bottom) + 1.25rem)",
        },
      })}
    >
      <Stack direction="row" justifyContent="flex-end" minHeight="2.75rem">
        {showClose ? (
          <IconButton
            aria-label="Cerrar cofre"
            onClick={onClose}
            sx={{
              color: "text.primary",
              background: "rgba(255,255,255,0.08)",
              width: 42,
              height: 42,
              "&:hover": { background: "rgba(255,255,255,0.14)" },
            }}
          >
            <Close />
          </IconButton>
        ) : null}
      </Stack>

      <Box
        data-testid="treasure-stage"
        sx={{
          alignSelf: "center",
          justifySelf: "center",
          position: "relative",
          width: "min(96vw, 44rem)",
          height: "min(43rem, calc(100dvh - 8.25rem))",
          minHeight: "min(34rem, calc(100dvh - 8.25rem))",
        }}
      >
        <Box
          sx={(theme) => ({
            position: "absolute",
            left: "50%",
            top: !started ? "42%" : { xs: "8%", sm: "6%" },
            width: "min(92vw, 38rem)",
            aspectRatio: "1 / 1",
            background: theme.trucoshiUi.treasure.stageGlow,
            filter: "blur(12px)",
            opacity: canShowReward ? 0.7 : 0.86,
            transform: !started ? "translate(-50%, -50%)" : "translate(-50%, 0)",
            pointerEvents: "none",
          })}
        />

        <Box
          data-frame={frame}
          data-testid="treasure-chest-frame"
          sx={{
            position: "absolute",
            left: "50%",
            top: !started ? "37%" : { xs: "-0.6rem", sm: "-0.8rem" },
            transform: !started
              ? "translate(-50%, -50%)"
              : canShowReward
                ? "translateX(-50%) translateY(-5%) scale(0.74)"
                : "translateX(-50%)",
            opacity: canShowReward ? 0.82 : 1,
            zIndex: 4,
            transition: "opacity 260ms ease, transform 420ms cubic-bezier(.19,1,.22,1)",
            animation:
              frame < 2 && !chestOpen ? "treasureChestAnticipation 300ms ease-in-out 1" : "none",
            "@keyframes treasureChestAnticipation": {
              "0%, 100%": {
                transform: !started
                  ? "translate(-50%, -50%) rotate(0deg)"
                  : "translateX(-50%) rotate(0deg)",
              },
              "30%": {
                transform: !started
                  ? "translate(-50%, -50%) rotate(-2deg)"
                  : "translateX(-50%) rotate(-2deg)",
              },
              "65%": {
                transform: !started
                  ? "translate(-50%, -50%) rotate(2deg)"
                  : "translateX(-50%) rotate(2deg)",
              },
            },
          }}
        >
          <ChestFrame frame={frame} />
        </Box>

        <Box
          aria-hidden
          data-active={canShowReward ? "true" : "false"}
          data-testid="treasure-light-burst"
          sx={{
            position: "absolute",
            left: "50%",
            top: { xs: "23%", sm: "21%" },
            width: { xs: "14rem", sm: "18rem" },
            height: { xs: "14rem", sm: "18rem" },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,220,116,0.72), rgba(255,190,46,0.24) 38%, transparent 68%)",
            opacity: canShowReward ? 1 : 0,
            transform: "translate(-50%, -50%) scale(0.82)",
            transition: "opacity 220ms ease, transform 420ms ease",
            ...(canShowReward && { transform: "translate(-50%, -50%) scale(1)" }),
            pointerEvents: "none",
          }}
        />

        {!started ? (
          <Stack
            alignItems="center"
            gap={1.25}
            sx={{
              position: "absolute",
              left: "50%",
              bottom: { xs: "4.25rem", sm: "4.75rem" },
              transform: "translateX(-50%)",
              zIndex: 5,
              width: "min(86vw, 18rem)",
            }}
          >
            <Button
              color="warning"
              data-testid="start-treasure-opening"
              disabled={opening}
              onClick={handleStartOpen}
              size="large"
              startIcon={
                opening ? <CircularProgress size={17} color="inherit" /> : <EmojiEvents />
              }
              sx={(theme) => theme.trucoshiUi.treasure.actionButton}
              variant="contained"
              fullWidth
            >
              Abrir cofre
            </Button>
          </Stack>
        ) : canShowReward && sceneResult ? (
          sceneResult.cardSkin ? (
            <Stack
              data-emerged={rewardPresented ? "true" : "false"}
              data-testid="treasure-reward"
              alignItems="center"
              gap={1.15}
              sx={(theme) => ({
                ...theme.trucoshiUi.treasure.rewardFrame,
                position: "absolute",
                left: "50%",
                top: "clamp(3.8rem, 13dvh, 6.5rem)",
                width: `min(92vw, calc(${REWARD_CARD_WIDTH} + 4.4rem))`,
                minHeight: `calc(${REWARD_CARD_WIDTH} * 1.48 + 5.1rem)`,
                px: { xs: 1.45, sm: 1.8 },
                py: { xs: 1.3, sm: 1.55 },
                opacity: rewardPresented ? 1 : 0,
                transform: rewardPresented
                  ? "translate(-50%, 0) scale(1)"
                  : "translate(-50%, 42%) scale(0.72)",
                transition: `opacity 220ms ease, transform ${REWARD_RISE_MS}ms cubic-bezier(.19,1,.22,1)`,
                zIndex: rewardPresented ? 6 : 2,
              })}
            >
              <TreasureResultSummary result={sceneResult} size="large" />
              <TreasureRewardCard
                result={sceneResult.cardSkin}
                revealed={rewardRevealed}
                canReveal={rewardPresented}
                onReveal={() => setRewardRevealed(true)}
              />
            </Stack>
          ) : (
            <Stack
              data-testid="treasure-empty-reward"
              alignItems="center"
              gap={1}
              sx={(theme) => ({
                ...theme.trucoshiUi.treasure.rewardFrame,
                position: "absolute",
                left: "50%",
                top: "clamp(9rem, 30dvh, 14rem)",
                width: "min(86vw, 22rem)",
                px: { xs: 3, sm: 3.4 },
                py: { xs: 2.6, sm: 3 },
                opacity: rewardPresented ? 1 : 0,
                transform: rewardPresented
                  ? "translate(-50%, 0) scale(1)"
                  : "translate(-50%, 28%) scale(0.78)",
                transition: `opacity 220ms ease, transform ${REWARD_RISE_MS}ms cubic-bezier(.19,1,.22,1)`,
                zIndex: 4,
              })}
            >
              <AutoAwesome color="warning" />
              <Typography variant="h6" fontWeight={900}>
                {getResultTitle(sceneResult)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getResultDescription(sceneResult)}
              </Typography>
            </Stack>
          )
        ) : (
          <Stack
            alignItems="center"
            gap={1}
            sx={{
              position: "absolute",
              left: "50%",
              bottom: { xs: "4.25rem", sm: "4.75rem" },
              transform: "translateX(-50%)",
              zIndex: 4,
            }}
          >
            <CircularProgress color="warning" size={26} />
            <Typography variant="body2" color="text.secondary" fontWeight={800}>
              Abriendo cofre...
            </Typography>
          </Stack>
        )}
      </Box>

      <Stack
        alignItems="center"
        justifyContent="center"
        minHeight={{ xs: "4.35rem", sm: "4.7rem" }}
      >
        {sceneResult ? (
          <Button
            color="warning"
            data-testid="treasure-done-button"
            onClick={onClose}
            sx={(theme) => theme.trucoshiUi.treasure.actionButton}
            variant="contained"
          >
            Listo
          </Button>
        ) : null}
      </Stack>
    </Box>,
    document.body,
  );
};

export const TreasureChestPanel = ({
  status,
  result,
  loading,
  opening,
  onOpenChest,
  onDevGrantChest,
  onEquipReward,
  fillHeight = true,
  onDismiss,
}: {
  status: ITreasureStatus;
  result: ITreasureOpenResult | null;
  loading: boolean;
  opening: boolean;
  onOpenChest: TreasureOpenHandler;
  onDevGrantChest?: TreasureDevGrantHandler;
  onEquipReward?: TreasureEquipRewardHandler;
  fillHeight?: boolean;
  onDismiss?: () => void;
}) => {
  const { queue } = useSound();
  const nextChest = status.unopenedChests[0];
  const hasChest = Boolean(nextChest);
  const progress = Math.min(status.progress, status.threshold);
  const progressRatio = status.threshold ? progress / status.threshold : 0;
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeChestId, setActiveChestId] = useState<number | null>(null);
  const [equipLoading, setEquipLoading] = useState(false);
  const [dismissedResultKey, setDismissedResultKey] = useState<string | null>(null);
  const resultDismissKey = result ? getResultDismissKey(result) : null;
  const compactResult = result && resultDismissKey !== dismissedResultKey ? result : null;

  const handleOpenChest = async () => {
    if (!nextChest || opening) {
      return;
    }

    setActiveChestId(nextChest.id);
    setOverlayOpen(true);
    queue("shuffle");

    try {
      const opened = await onOpenChest(nextChest.id);

      if (opened === false) {
        setOverlayOpen(false);
      }
    } catch {
      setOverlayOpen(false);
    }
  };

  const handleCloseOverlay = () => {
    if (opening && (!result || result.chestId !== activeChestId)) {
      return;
    }

    setOverlayOpen(false);
  };

  const handleEquipReward = async () => {
    if (!result?.cardSkin || !onEquipReward || equipLoading) {
      return;
    }

    setEquipLoading(true);
    queue("play0");

    try {
      const equipped = await onEquipReward(result.cardSkin);

      if (equipped !== false) {
        setDismissedResultKey(getResultDismissKey(result));
      }
    } finally {
      setEquipLoading(false);
    }
  };

  const handleDismissResult = () => {
    if (!resultDismissKey) {
      return;
    }

    setDismissedResultKey(resultDismissKey);
  };

  return (
    <>
      <Box
        data-ready={hasChest ? "true" : "false"}
        data-testid="treasure-panel"
        sx={(theme) => ({
          ...theme.trucoshiUi.inventory.surfaceFrame,
          position: "relative",
          overflow: "hidden",
          height: fillHeight ? "100%" : "auto",
          p: { xs: 1.45, sm: 1.7 },
          pr: onDismiss ? { xs: 5.3, sm: 5.7 } : undefined,
          background: theme.trucoshiUi.treasure.panelSurface,
        })}
      >
        {onDismiss ? (
          <IconButton
            aria-label="Ocultar progreso de cofre"
            data-testid="dismiss-treasure-panel"
            onClick={onDismiss}
            size="small"
            sx={{
              position: "absolute",
              top: { xs: 7, sm: 9 },
              right: { xs: 7, sm: 9 },
              width: 30,
              height: 30,
              borderRadius: "0.45rem",
              color: "text.secondary",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 2,
              "&:hover": {
                background: "rgba(255,255,255,0.11)",
                color: "text.primary",
              },
            }}
          >
            <Close sx={{ fontSize: "1rem" }} />
          </IconButton>
        ) : null}
        <Stack data-testid="treasure-dock" gap={{ xs: 1.05, sm: 1.25 }}>
          <Box
            data-testid="treasure-progress-row"
            sx={{
              display: "grid",
              gridTemplateColumns: compactResult
                ? {
                    xs: "auto minmax(5.6rem, 1fr) minmax(8.6rem, auto)",
                    sm: "auto minmax(0, 1fr) minmax(11rem, auto)",
                  }
                : "auto minmax(0, 1fr)",
              alignItems: "center",
              columnGap: { xs: 1.1, sm: 1.35 },
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: "4.35rem", sm: "4.8rem" },
                height: { xs: "4.35rem", sm: "4.8rem" },
                flex: "0 0 auto",
                borderRadius: 1.15,
                background: hasChest ? "rgba(255,193,7,0.13)" : "rgba(255,255,255,0.045)",
                boxShadow: `inset 0 0 0 1px ${
                  hasChest ? "rgba(255,214,93,0.22)" : "rgba(255,255,255,0.08)"
                }`,
              }}
            >
              {loading ? (
                <CircularProgress size={28} color="warning" />
              ) : (
                <ChestFrame frame={hasChest ? CHEST_FRAME_COUNT - 1 : 0} size="3.85rem" mini />
              )}
            </Box>

            <Tooltip title="Jugá partidas online para desbloquear nuevos skins">
              <Stack minWidth={0} gap={0.8}>
                <Stack direction="row" alignItems="baseline" gap={0.8} minWidth={0}>
                  <Typography variant="h6" fontWeight={950} noWrap sx={{ lineHeight: 1.05 }}>
                    {hasChest ? "Cofre listo" : `Progreso ${progress}/${status.threshold}`}
                  </Typography>
                  {opening ? (
                    <Typography variant="body2" color="warning.light" fontWeight={900} noWrap>
                      Abriendo
                    </Typography>
                  ) : null}
                </Stack>
                <Box
                  data-testid="treasure-progress"
                  sx={(theme) => ({
                    position: "relative",
                    height: { xs: 8, sm: 9 },
                    borderRadius: 999,
                    background: theme.trucoshiUi.treasure.progressTrack,
                    overflow: "hidden",
                  })}
                >
                  <Box
                    data-testid="treasure-progress-fill"
                    sx={(theme) => ({
                      position: "absolute",
                      inset: 0,
                      width: hasChest ? "100%" : `${progressRatio * 100}%`,
                      borderRadius: "inherit",
                      background: theme.trucoshiUi.treasure.progressFill,
                      transition: theme.transitions.create("width", {
                        duration: theme.transitions.duration.short,
                      }),
                    })}
                  />
                </Box>
                {!compactResult ? (
                  <Typography
                    data-testid="treasure-last-result"
                    variant="body2"
                    color="text.secondary"
                    textAlign="right"
                    fontWeight={800}
                    sx={{ lineHeight: 1.15 }}
                  >
                    {hasChest
                      ? "Abrilo para revelar una skin."
                      : "Segui jugando para desbloquearlo."}
                  </Typography>
                ) : null}
              </Stack>
            </Tooltip>

            {compactResult ? (
              <Stack
                data-testid="treasure-last-result"
                direction="row"
                alignItems="center"
                gap={1}
                justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                minWidth={0}
              >
                {compactResult.cardSkin ? (
                  <GameCard
                    card={compactResult.cardSkin.card}
                    cardSkinId={compactResult.cardSkin.id}
                    displayMode="skins"
                    disableButton
                    width="2.1rem"
                    shadow
                  />
                ) : (
                  <Inventory2 color="warning" sx={{ fontSize: "1.25rem" }} />
                )}
                <Stack gap={0.5} minWidth={0} alignItems="flex-start">
                  <TreasureResultSummary result={compactResult} />
                  <Stack direction="row" alignItems="center" gap={0.45} sx={{ width: "100%" }}>
                    {compactResult.cardSkin && onEquipReward ? (
                      <Button
                        color="warning"
                        data-testid="treasure-equip-reward"
                        disabled={equipLoading}
                        onClick={handleEquipReward}
                        size="small"
                        startIcon={
                          equipLoading ? <CircularProgress size={14} color="inherit" /> : null
                        }
                        sx={{
                          flex: 1,
                          minHeight: 26,
                          px: 1.15,
                          py: 0.12,
                          fontSize: "0.76rem",
                          fontWeight: 950,
                          lineHeight: 1,
                        }}
                        variant="contained"
                      >
                        Equipar
                      </Button>
                    ) : null}
                    <IconButton
                      aria-label="Descartar resultado"
                      data-testid="treasure-dismiss-result"
                      onClick={handleDismissResult}
                      size="small"
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "0.45rem",
                        color: "text.secondary",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        "&:hover": {
                          background: "rgba(255,255,255,0.11)",
                          color: "text.primary",
                        },
                      }}
                    >
                      <Close sx={{ fontSize: "0.92rem" }} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>
            ) : null}
          </Box>

          <Stack
            data-testid="treasure-action-row"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={0.85}
            flexWrap="wrap"
          >
            {hasChest ? (
              <Button
                data-testid="open-treasure-chest"
                color="warning"
                disabled={opening}
                onClick={handleOpenChest}
                size="medium"
                startIcon={
                  opening ? <CircularProgress size={16} color="inherit" /> : <EmojiEvents />
                }
                variant="contained"
                fullWidth
                sx={{ fontWeight: 950 }}
              >
                Abrir cofre ({status.unopenedChests.length})
              </Button>
            ) : null}

            {import.meta.env.DEV && onDevGrantChest ? (
              <Button
                data-testid="dev-grant-treasure-chest"
                color="inherit"
                disabled={loading || opening}
                onClick={() => onDevGrantChest()}
                size="medium"
                fullWidth
                sx={(theme) => theme.trucoshiUi.treasure.secondaryButton}
                variant="outlined"
              >
                Dar cofre
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Box>

      <TreasureOpeningOverlay
        open={overlayOpen}
        opening={opening}
        result={result}
        chestId={activeChestId}
        onClose={handleCloseOverlay}
      />
    </>
  );
};
