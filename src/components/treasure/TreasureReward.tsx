import { AutoAwesome } from "@mui/icons-material";
import { CircularProgress, Typography } from "@mui/material";
import { BURNT_CARD, ITreasureOpenResult } from "trucoshi";
import { GameCard } from "../card/GameCard";
import {
  EmptyRewardFrame,
  RarityBadgeRoot,
  ResultCardLabel,
  ResultSummaryRoot,
  ResultTitle,
  RewardCardButton,
  RewardCardFace,
  RewardFlipInner,
  SkinRewardFrame,
} from "./TreasureChestPanel.styles";
import {
  getResultCardLabel,
  getResultDescription,
  getResultRarity,
  getResultTitle,
  rarityLabel,
} from "./treasureResult";

export const REWARD_CARD_WIDTH = "var(--treasure-reward-card-width)";

export const TreasureRarityBadge = ({
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
    <RarityBadgeRoot
      component="span"
      data-rarity={rarity}
      data-testid={`treasure-rarity-${rarity}`}
      rarity={rarity}
      badgeSize={size}
    >
      {rarityLabel[rarity] || rarity}
    </RarityBadgeRoot>
  );
};

export const TreasureResultSummary = ({
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
    <ResultSummaryRoot data-testid="treasure-result-summary" summarySize={size}>
      <ResultTitle component="span" data-testid="treasure-result-title" summarySize={size}>
        {getResultTitle(result)}
      </ResultTitle>
      {cardLabel ? (
        <ResultCardLabel component="span" summarySize={size}>
          {cardLabel}
        </ResultCardLabel>
      ) : null}
      <TreasureRarityBadge rarity={rarity} size={size} />
    </ResultSummaryRoot>
  );
};

export const TreasureRewardCard = ({
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
  <RewardCardButton
    aria-label={revealed ? "Skin revelada" : "Revelar skin"}
    data-card-scale="inspect"
    data-flipped={revealed ? "true" : "false"}
    data-reveal-ready={canReveal ? "true" : "false"}
    data-testid="treasure-reward-card"
    disabled={!canReveal}
    onClick={() => canReveal && onReveal()}
    sx={{
      cursor: canReveal && !revealed ? "pointer" : "default",
      filter: canReveal ? "none" : "brightness(0.82) saturate(0.9)",
    }}
  >
    <RewardFlipInner revealed={revealed}>
      <RewardCardFace>
        <GameCard
          card={BURNT_CARD}
          displayMode="default"
          disableButton
          shadow
          width={REWARD_CARD_WIDTH}
        />
      </RewardCardFace>
      <RewardCardFace back>
        <GameCard
          card={result.card}
          cardSkinId={result.id}
          displayMode="skins"
          disableButton
          shadow
          width={REWARD_CARD_WIDTH}
        />
      </RewardCardFace>
    </RewardFlipInner>
  </RewardCardButton>
);

export const TreasureSkinReward = ({
  result,
  rewardPresented,
  rewardRevealed,
  onReveal,
}: {
  result: ITreasureOpenResult;
  rewardPresented: boolean;
  rewardRevealed: boolean;
  onReveal: () => void;
}) => {
  if (!result.cardSkin) {
    return null;
  }

  return (
    <SkinRewardFrame
      data-emerged={rewardPresented ? "true" : "false"}
      data-testid="treasure-reward"
      emerged={rewardPresented}
    >
      <TreasureResultSummary result={result} size="large" />
      <TreasureRewardCard
        result={result.cardSkin}
        revealed={rewardRevealed}
        canReveal={rewardPresented}
        onReveal={onReveal}
      />
    </SkinRewardFrame>
  );
};

export const TreasureEmptyReward = ({
  result,
  rewardPresented,
}: {
  result: ITreasureOpenResult;
  rewardPresented: boolean;
}) => (
  <EmptyRewardFrame
    data-testid="treasure-empty-reward"
    alignItems="center"
    gap={1}
    emerged={rewardPresented}
  >
    <AutoAwesome color="warning" />
    <Typography variant="h6" fontWeight={900}>
      {getResultTitle(result)}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {getResultDescription(result)}
    </Typography>
  </EmptyRewardFrame>
);

export const EquipLoadingIcon = () => <CircularProgress size={14} color="inherit" />;
