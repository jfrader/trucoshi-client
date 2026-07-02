import { Close } from "@mui/icons-material";
import { ITreasureOpenResult, ITreasureStatus } from "trucoshi";
import { useState } from "react";
import { DismissPanelButton, PanelRoot } from "./TreasureChestPanel.styles";
import { TreasureOpeningOverlay } from "./TreasureOpeningOverlay";
import { TreasureProgressDock } from "./TreasureProgressDock";
import { getResultDismissKey } from "./treasureResult";
import { useTreasureSound } from "./useTreasureSound";

type TreasureOpenHandler = (chestId: number) => Promise<boolean> | boolean | void;
type TreasureDevGrantHandler = () => Promise<boolean> | boolean | void;
type TreasureEquipRewardHandler = (
  cardSkin: NonNullable<ITreasureOpenResult["cardSkin"]>,
) => Promise<boolean> | boolean | void;

export { TreasureOpeningOverlay } from "./TreasureOpeningOverlay";

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
  const { queue } = useTreasureSound();
  const nextChest = status.unopenedChests[0];
  const hasChest = Boolean(nextChest);
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
    queue("menu1");

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
      <PanelRoot
        data-ready={hasChest ? "true" : "false"}
        data-testid="treasure-panel"
        fillHeight={fillHeight}
        dismissible={Boolean(onDismiss)}
      >
        {onDismiss ? (
          <DismissPanelButton
            aria-label="Ocultar progreso de cofre"
            data-testid="dismiss-treasure-panel"
            onClick={onDismiss}
            size="small"
          >
            <Close sx={{ fontSize: "1rem" }} />
          </DismissPanelButton>
        ) : null}

        <TreasureProgressDock
          status={status}
          compactResult={compactResult}
          loading={loading}
          opening={opening}
          onOpenChest={handleOpenChest}
          onDevGrantChest={onDevGrantChest}
          onEquipReward={handleEquipReward}
          onDismissResult={handleDismissResult}
          equipLoading={equipLoading}
          canEquipReward={Boolean(onEquipReward)}
        />
      </PanelRoot>

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
