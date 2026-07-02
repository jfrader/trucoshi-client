import { Close, EmojiEvents, Inventory2 } from "@mui/icons-material";
import { Box, Button, CircularProgress, Tooltip, Typography } from "@mui/material";
import { ITreasureOpenResult, ITreasureStatus } from "trucoshi";
import { GameCard } from "../card/GameCard";
import {
  ActionRow,
  ChestIconFrame,
  CompactEquipButton,
  CompactResultActions,
  CompactResultBody,
  CompactResultRoot,
  DismissResultButton,
  DockStack,
  ProgressFill,
  ProgressInfo,
  ProgressRow,
  ProgressTitleRow,
  ProgressTrack,
  SecondaryActionButton,
} from "./TreasureChestPanel.styles";
import { CHEST_FRAME_COUNT, ChestFrame } from "./TreasureChestSprite";
import { EquipLoadingIcon, TreasureResultSummary } from "./TreasureReward";

const TreasureProgressIcon = ({
  ready,
  loading,
}: {
  ready: boolean;
  loading: boolean;
}) => (
  <ChestIconFrame ready={ready}>
    {loading ? (
      <CircularProgress size={28} color="warning" />
    ) : (
      <ChestFrame frame={ready ? CHEST_FRAME_COUNT - 1 : 0} size="3.85rem" mini />
    )}
  </ChestIconFrame>
);

const TreasureProgressCopy = ({
  ready,
  opening,
  progress,
  threshold,
  progressPercent,
  hasResult,
}: {
  ready: boolean;
  opening: boolean;
  progress: number;
  threshold: number;
  progressPercent: number;
  hasResult: boolean;
}) => (
  <ProgressInfo>
    <ProgressTitleRow>
      <Typography variant="h6" fontWeight={950} noWrap sx={{ lineHeight: 1.05 }}>
        {ready ? "Cofre listo" : `Progreso ${progress}/${threshold}`}
      </Typography>
      {opening ? (
        <Typography variant="body2" color="warning.light" fontWeight={900} noWrap>
          Abriendo
        </Typography>
      ) : null}
    </ProgressTitleRow>
    <ProgressTrack data-testid="treasure-progress">
      <ProgressFill data-testid="treasure-progress-fill" widthPercent={progressPercent} />
    </ProgressTrack>
    {!hasResult ? (
      <Typography
        data-testid="treasure-last-result"
        variant="body2"
        color="text.secondary"
        textAlign="right"
        fontWeight={800}
        sx={{ lineHeight: 1.15 }}
      >
        {ready ? "Abrilo para revelar una skin." : "Segui jugando para desbloquearlo."}
      </Typography>
    ) : null}
  </ProgressInfo>
);

const CompactResultPreview = ({ result }: { result: ITreasureOpenResult }) =>
  result.cardSkin ? (
    <GameCard
      card={result.cardSkin.card}
      cardSkinId={result.cardSkin.id}
      displayMode="skins"
      disableButton
      width="2.1rem"
      shadow
    />
  ) : (
    <Inventory2 color="warning" sx={{ fontSize: "1.25rem" }} />
  );

const CompactResultControls = ({
  result,
  canEquip,
  equipLoading,
  onEquip,
  onDismiss,
}: {
  result: ITreasureOpenResult;
  canEquip: boolean;
  equipLoading: boolean;
  onEquip: () => void;
  onDismiss: () => void;
}) => (
  <CompactResultActions>
    {result.cardSkin && canEquip ? (
      <CompactEquipButton
        color="warning"
        data-testid="treasure-equip-reward"
        disabled={equipLoading}
        onClick={onEquip}
        size="small"
        startIcon={equipLoading ? <EquipLoadingIcon /> : null}
        variant="contained"
      >
        Equipar
      </CompactEquipButton>
    ) : null}
    <DismissResultButton
      aria-label="Descartar resultado"
      data-testid="treasure-dismiss-result"
      onClick={onDismiss}
      size="small"
    >
      <Close sx={{ fontSize: "0.92rem" }} />
    </DismissResultButton>
  </CompactResultActions>
);

const CompactResultStrip = ({
  result,
  canEquip,
  equipLoading,
  onEquip,
  onDismiss,
}: {
  result: ITreasureOpenResult;
  canEquip: boolean;
  equipLoading: boolean;
  onEquip: () => void;
  onDismiss: () => void;
}) => (
  <CompactResultRoot data-testid="treasure-last-result">
    <CompactResultPreview result={result} />
    <CompactResultBody>
      <TreasureResultSummary result={result} />
      <CompactResultControls
        result={result}
        canEquip={canEquip}
        equipLoading={equipLoading}
        onEquip={onEquip}
        onDismiss={onDismiss}
      />
    </CompactResultBody>
  </CompactResultRoot>
);

export const TreasureProgressDock = ({
  status,
  compactResult,
  loading,
  opening,
  onOpenChest,
  onDevGrantChest,
  onEquipReward,
  onDismissResult,
  equipLoading,
  canEquipReward,
}: {
  status: ITreasureStatus;
  compactResult: ITreasureOpenResult | null;
  loading: boolean;
  opening: boolean;
  onOpenChest: () => void;
  onDevGrantChest?: () => Promise<boolean> | boolean | void;
  onEquipReward: () => void;
  onDismissResult: () => void;
  equipLoading: boolean;
  canEquipReward: boolean;
}) => {
  const ready = Boolean(status.unopenedChests[0]);
  const progress = Math.min(status.progress, status.threshold);
  const progressRatio = status.threshold ? progress / status.threshold : 0;
  const progressPercent = ready ? 100 : progressRatio * 100;

  return (
    <DockStack data-testid="treasure-dock">
      <ProgressRow data-testid="treasure-progress-row" withResult={Boolean(compactResult)}>
        <TreasureProgressIcon ready={ready} loading={loading} />
        <Tooltip title="Jugá partidas online para desbloquear nuevos skins">
          <Box component="span" sx={{ display: "block", minWidth: 0 }}>
            <TreasureProgressCopy
              ready={ready}
              opening={opening}
              progress={progress}
              threshold={status.threshold}
              progressPercent={progressPercent}
              hasResult={Boolean(compactResult)}
            />
          </Box>
        </Tooltip>
        {compactResult ? (
          <CompactResultStrip
            result={compactResult}
            canEquip={canEquipReward}
            equipLoading={equipLoading}
            onEquip={onEquipReward}
            onDismiss={onDismissResult}
          />
        ) : null}
      </ProgressRow>

      <ActionRow data-testid="treasure-action-row">
        {ready ? (
          <Button
            data-testid="open-treasure-chest"
            color="warning"
            disabled={opening}
            onClick={onOpenChest}
            size="medium"
            startIcon={opening ? <CircularProgress size={16} color="inherit" /> : <EmojiEvents />}
            variant="contained"
            fullWidth
            sx={{ fontWeight: 950 }}
          >
            Abrir cofre ({status.unopenedChests.length})
          </Button>
        ) : null}

        {import.meta.env.DEV && onDevGrantChest ? (
          <SecondaryActionButton
            data-testid="dev-grant-treasure-chest"
            color="inherit"
            disabled={loading || opening}
            onClick={() => onDevGrantChest()}
            size="medium"
            fullWidth
            variant="outlined"
          >
            Dar cofre
          </SecondaryActionButton>
        ) : null}
      </ActionRow>
    </DockStack>
  );
};
