import { Box, Button, ButtonBase, IconButton, Stack, Theme, styled } from "@mui/material";

const APP_VIEWPORT_HEIGHT = "var(--trucoshi-viewport-height, 100dvh)";

const squareButton = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  "&:hover": {
    background: "rgba(255,255,255,0.11)",
    color: theme.palette.text.primary,
  },
});

export const PanelRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "fillHeight" && prop !== "dismissible",
})<{ fillHeight: boolean; dismissible: boolean }>(({ theme, fillHeight, dismissible }) => ({
  ...theme.trucoshiUi.inventory.surfaceFrame,
  position: "relative",
  overflow: "hidden",
  height: fillHeight ? "100%" : "auto",
  padding: "1.45rem",
  paddingRight: dismissible ? "5.3rem" : undefined,
  background: theme.trucoshiUi.treasure.panelSurface,
  [theme.breakpoints.up("sm")]: {
    padding: "1.7rem",
    paddingRight: dismissible ? "5.7rem" : undefined,
  },
}));

export const DismissPanelButton = styled(IconButton)(({ theme }) => ({
  ...squareButton(theme),
  position: "absolute",
  top: 7,
  right: 7,
  width: 30,
  height: 30,
  borderRadius: "0.45rem",
  zIndex: 2,
  [theme.breakpoints.up("sm")]: {
    top: 9,
    right: 9,
  },
}));

export const DockStack = styled(Stack)(({ theme }) => ({
  gap: "1.05rem",
  [theme.breakpoints.up("sm")]: {
    gap: "1.25rem",
  },
}));

export const ProgressRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "withResult",
})<{ withResult: boolean }>(({ theme, withResult }) => ({
  display: "grid",
  gridTemplateColumns: withResult
    ? "auto minmax(5.6rem, 1fr) minmax(8.6rem, auto)"
    : "auto minmax(0, 1fr)",
  alignItems: "center",
  columnGap: "1.1rem",
  minWidth: 0,
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: withResult
      ? "auto minmax(0, 1fr) minmax(11rem, auto)"
      : "auto minmax(0, 1fr)",
    columnGap: "1.35rem",
  },
}));

export const ChestIconFrame = styled(Box, {
  shouldForwardProp: (prop) => prop !== "ready",
})<{ ready: boolean }>(({ ready, theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "4.35rem",
  height: "4.35rem",
  flex: "0 0 auto",
  borderRadius: theme.shape.borderRadius * 1.15,
  background: ready ? "rgba(255,193,7,0.13)" : "rgba(255,255,255,0.045)",
  boxShadow: `inset 0 0 0 1px ${
    ready ? "rgba(255,214,93,0.22)" : "rgba(255,255,255,0.08)"
  }`,
  [theme.breakpoints.up("sm")]: {
    width: "4.8rem",
    height: "4.8rem",
  },
}));

export const ProgressInfo = styled(Stack)({
  minWidth: 0,
  gap: "0.8rem",
});

export const ProgressTitleRow = styled(Stack)({
  flexDirection: "row",
  alignItems: "baseline",
  gap: "0.8rem",
  minWidth: 0,
});

export const ProgressTrack = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 8,
  borderRadius: 999,
  background: theme.trucoshiUi.treasure.progressTrack,
  overflow: "hidden",
  [theme.breakpoints.up("sm")]: {
    height: 9,
  },
}));

export const ProgressFill = styled(Box, {
  shouldForwardProp: (prop) => prop !== "widthPercent",
})<{ widthPercent: number }>(({ theme, widthPercent }) => ({
  position: "absolute",
  inset: 0,
  width: `${widthPercent}%`,
  borderRadius: "inherit",
  background: theme.trucoshiUi.treasure.progressFill,
  transition: theme.transitions.create("width", {
    duration: theme.transitions.duration.short,
  }),
}));

export const CompactResultRoot = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1),
  justifyContent: "flex-start",
  minWidth: 0,
  [theme.breakpoints.up("sm")]: {
    justifyContent: "flex-end",
  },
}));

export const CompactResultBody = styled(Stack)({
  gap: "0.5rem",
  minWidth: 0,
  alignItems: "flex-start",
});

export const CompactResultActions = styled(Stack)({
  flexDirection: "row",
  alignItems: "center",
  gap: "0.45rem",
  width: "100%",
});

export const CompactEquipButton = styled(Button)({
  flex: 1,
  minHeight: 26,
  paddingInline: "1.15rem",
  paddingBlock: "0.12rem",
  fontSize: "0.76rem",
  fontWeight: 950,
  lineHeight: 1,
});

export const DismissResultButton = styled(IconButton)(({ theme }) => ({
  ...squareButton(theme),
  width: 26,
  height: 26,
  borderRadius: "0.45rem",
}));

export const ActionRow = styled(Stack)({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.85rem",
  flexWrap: "wrap",
});

export const SecondaryActionButton = styled(Button)(({ theme }) => ({
  ...theme.trucoshiUi.treasure.secondaryButton,
}));

export const OverlayRoot = styled(Box)(({ theme }) => ({
  position: "fixed",
  inset: 0,
  width: "100%",
  height: APP_VIEWPORT_HEIGHT,
  maxHeight: APP_VIEWPORT_HEIGHT,
  zIndex: theme.zIndex.tooltip + 20,
  color: theme.palette.text.primary,
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
  background: theme.trucoshiUi.treasure.overlayBackground,
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  paddingInline: theme.spacing(1),
  paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
  paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
  [theme.breakpoints.up("sm")]: {
    paddingInline: theme.spacing(2),
    paddingTop: "calc(env(safe-area-inset-top) + 1.1rem)",
    paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)",
  },
}));

export const OverlayHeader = styled(Stack)({
  flexDirection: "row",
  justifyContent: "flex-end",
  minHeight: "2.75rem",
});

export const OverlayCloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  background: "rgba(255,255,255,0.08)",
  width: 42,
  height: 42,
  "&:hover": {
    background: "rgba(255,255,255,0.14)",
  },
}));

export const Stage = styled(Box)({
  alignSelf: "center",
  justifySelf: "center",
  position: "relative",
  width: "min(96vw, 44rem)",
  height: `min(43rem, calc(${APP_VIEWPORT_HEIGHT} - 8.25rem))`,
  minHeight: `min(34rem, calc(${APP_VIEWPORT_HEIGHT} - 8.25rem))`,
});

export const StageGlow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "started" && prop !== "canShowReward",
})<{ started: boolean; canShowReward: boolean }>(({ theme, started, canShowReward }) => ({
  position: "absolute",
  left: "50%",
  top: started ? "8%" : "42%",
  width: "min(92vw, 38rem)",
  aspectRatio: "1 / 1",
  background: theme.trucoshiUi.treasure.stageGlow,
  filter: "blur(12px)",
  opacity: canShowReward ? 0.7 : 0.86,
  transform: started ? "translate(-50%, 0)" : "translate(-50%, -50%)",
  pointerEvents: "none",
  [theme.breakpoints.up("sm")]: {
    top: started ? "6%" : "42%",
  },
}));

const chestTransform = (started: boolean, canShowReward: boolean) => {
  if (!started) {
    return "translate(-50%, -50%)";
  }

  return canShowReward ? "translateX(-50%) translateY(-5%) scale(0.74)" : "translateX(-50%)";
};

const chestWobbleTransform = (started: boolean, degrees: number) =>
  started ? `translateX(-50%) rotate(${degrees}deg)` : `translate(-50%, -50%) rotate(${degrees}deg)`;

export const AnimatedChestFrame = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "started" && prop !== "canShowReward" && prop !== "frame" && prop !== "chestOpen",
})<{ started: boolean; canShowReward: boolean; frame: number; chestOpen: boolean }>(
  ({ theme, started, canShowReward, frame, chestOpen }) => ({
    position: "absolute",
    left: "50%",
    top: started ? "-0.6rem" : "37%",
    transform: chestTransform(started, canShowReward),
    opacity: canShowReward ? 0.82 : 1,
    zIndex: 4,
    transition: "opacity 260ms ease, transform 420ms cubic-bezier(.19,1,.22,1)",
    animation: frame < 2 && !chestOpen ? "treasureChestAnticipation 300ms ease-in-out 1" : "none",
    "@keyframes treasureChestAnticipation": {
      "0%, 100%": {
        transform: chestWobbleTransform(started, 0),
      },
      "30%": {
        transform: chestWobbleTransform(started, -2),
      },
      "65%": {
        transform: chestWobbleTransform(started, 2),
      },
    },
    [theme.breakpoints.up("sm")]: {
      top: started ? "-0.8rem" : "37%",
    },
  }),
);

export const LightBurst = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ theme, active }) => ({
  position: "absolute",
  left: "50%",
  top: "23%",
  width: "14rem",
  height: "14rem",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(255,220,116,0.72), rgba(255,190,46,0.24) 38%, transparent 68%)",
  opacity: active ? 1 : 0,
  transform: `translate(-50%, -50%) scale(${active ? 1 : 0.82})`,
  transition: "opacity 220ms ease, transform 420ms ease",
  pointerEvents: "none",
  [theme.breakpoints.up("sm")]: {
    top: "21%",
    width: "18rem",
    height: "18rem",
  },
}));

export const StartActionWrap = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  gap: "1.25rem",
  position: "absolute",
  left: "50%",
  bottom: "4.25rem",
  transform: "translateX(-50%)",
  zIndex: 5,
  width: "min(86vw, 18rem)",
  [theme.breakpoints.up("sm")]: {
    bottom: "4.75rem",
  },
}));

export const LoadingState = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  gap: theme.spacing(1),
  position: "absolute",
  left: "50%",
  bottom: "4.25rem",
  transform: "translateX(-50%)",
  zIndex: 4,
  [theme.breakpoints.up("sm")]: {
    bottom: "4.75rem",
  },
}));

export const OverlayFooter = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  justifyContent: "center",
  minHeight: "4.35rem",
  [theme.breakpoints.up("sm")]: {
    minHeight: "4.7rem",
  },
}));

export const PrimaryTreasureButton = styled(Button)(({ theme }) => ({
  ...theme.trucoshiUi.treasure.actionButton,
}));

export const RarityBadgeRoot = styled("span", {
  shouldForwardProp: (prop) => prop !== "rarity" && prop !== "badgeSize",
})<{ rarity: string; badgeSize: "compact" | "large" }>(({ theme, rarity, badgeSize }) => ({
  ...(theme.trucoshiUi.treasure.rarityStyles[rarity] ||
    theme.trucoshiUi.treasure.rarityStyles.COMMON),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: badgeSize === "large" ? "1.75rem" : "1.35rem",
  paddingInline: badgeSize === "large" ? "1.1rem" : "0.8rem",
  paddingBlock: badgeSize === "large" ? "0.28rem" : "0.16rem",
  borderRadius: "999px",
  fontSize: badgeSize === "large" ? "0.98rem" : "0.78rem",
  fontWeight: 950,
  lineHeight: 1,
  letterSpacing: 0,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  [theme.breakpoints.up("sm")]: {
    minHeight: badgeSize === "large" ? "1.95rem" : "1.35rem",
    paddingInline: badgeSize === "large" ? "1.3rem" : "0.8rem",
    fontSize: badgeSize === "large" ? "1.08rem" : "0.78rem",
  },
}));

export const ResultSummaryRoot = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "summarySize",
})<{ summarySize: "compact" | "large" }>(({ summarySize }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: summarySize === "large" ? "center" : "flex-start",
  gap: summarySize === "large" ? "0.75rem" : "0.55rem",
  flexWrap: "wrap",
  minWidth: 0,
}));

export const ResultTitle = styled("span", {
  shouldForwardProp: (prop) => prop !== "summarySize",
})<{ summarySize: "compact" | "large" }>(({ theme, summarySize }) => ({
  color: summarySize === "large" ? theme.palette.warning.light : theme.palette.text.primary,
  fontWeight: 950,
  fontSize: summarySize === "large" ? "1.12rem" : "0.92rem",
  lineHeight: 1.05,
  textShadow: "0 0 12px rgba(255,193,55,0.35)",
  whiteSpace: "nowrap",
  [theme.breakpoints.up("sm")]: {
    fontSize: summarySize === "large" ? "1.3rem" : "0.92rem",
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: summarySize === "large" ? "1.3rem" : "1rem",
  },
}));

export const ResultCardLabel = styled("span", {
  shouldForwardProp: (prop) => prop !== "summarySize",
})<{ summarySize: "compact" | "large" }>(({ theme, summarySize }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 900,
  fontSize: summarySize === "large" ? "1rem" : "0.86rem",
  lineHeight: 1.05,
  whiteSpace: "nowrap",
  [theme.breakpoints.up("sm")]: {
    fontSize: summarySize === "large" ? "1.12rem" : "0.86rem",
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: summarySize === "large" ? "1.12rem" : "0.95rem",
  },
}));

export const RewardCardButton = styled(ButtonBase)(({
  theme,
}) => ({
  "--treasure-reward-card-width": "clamp(11.5rem, min(58vw, 38dvh), 17rem)",
  width: "var(--treasure-reward-card-width)",
  height: "calc(var(--treasure-reward-card-width) * 1.48)",
  borderRadius: "calc(var(--treasure-reward-card-width) / 13)",
  overflow: "visible",
  padding: 0,
  perspective: "48rem",
  transition: "filter 180ms ease, transform 180ms ease",
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: theme.palette.warning.main,
    outlineOffset: 6,
  },
}));

export const RewardFlipInner = styled(Box, {
  shouldForwardProp: (prop) => prop !== "revealed",
})<{ revealed: boolean }>(({ theme, revealed }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  transformStyle: "preserve-3d",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
}));

export const RewardCardFace = styled(Box, {
  shouldForwardProp: (prop) => prop !== "back",
})<{ back?: boolean }>(({ back }) => ({
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  transform: back ? "rotateY(180deg)" : undefined,
}));

export const SkinRewardFrame = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "emerged",
})<{ emerged: boolean }>(({ theme, emerged }) => ({
  "--treasure-reward-card-width": "clamp(11.5rem, min(58vw, 38dvh), 17rem)",
  ...theme.trucoshiUi.treasure.rewardFrame,
  alignItems: "center",
  gap: "1.15rem",
  position: "absolute",
  left: "50%",
  top: "clamp(3.8rem, 13dvh, 6.5rem)",
  width: "min(92vw, calc(var(--treasure-reward-card-width) + 4.4rem))",
  minHeight: "calc(var(--treasure-reward-card-width) * 1.48 + 5.1rem)",
  paddingInline: "1.45rem",
  paddingBlock: "1.3rem",
  opacity: emerged ? 1 : 0,
  transform: emerged ? "translate(-50%, 0) scale(1)" : "translate(-50%, 42%) scale(0.72)",
  transition: "opacity 220ms ease, transform 520ms cubic-bezier(.19,1,.22,1)",
  zIndex: emerged ? 6 : 2,
  [theme.breakpoints.up("sm")]: {
    paddingInline: "1.8rem",
    paddingBlock: "1.55rem",
  },
}));

export const EmptyRewardFrame = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "emerged",
})<{ emerged: boolean }>(({ theme, emerged }) => ({
  ...theme.trucoshiUi.treasure.rewardFrame,
  alignItems: "center",
  gap: theme.spacing(1),
  position: "absolute",
  left: "50%",
  top: "clamp(9rem, 30dvh, 14rem)",
  width: "min(86vw, 22rem)",
  paddingInline: "3rem",
  paddingBlock: "2.6rem",
  opacity: emerged ? 1 : 0,
  transform: emerged ? "translate(-50%, 0) scale(1)" : "translate(-50%, 28%) scale(0.78)",
  transition: "opacity 220ms ease, transform 520ms cubic-bezier(.19,1,.22,1)",
  zIndex: 4,
  [theme.breakpoints.up("sm")]: {
    paddingInline: "3.4rem",
    paddingBlock: "3rem",
  },
}));
