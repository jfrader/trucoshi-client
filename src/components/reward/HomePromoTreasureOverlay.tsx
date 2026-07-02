import { useEffect, useState } from "react";
import { TreasureOpeningOverlay } from "../treasure/TreasureChestPanel";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { clearPromoChestReady, hasPromoChestReady } from "./rewardCodeStorage";

export const HomePromoTreasureOverlay = () => {
  const [
    { treasureStatus, treasureLoading, treasureOpening, treasureResult },
    { openTreasureChest },
  ] = useTrucoshi();
  const nextChest = treasureStatus.unopenedChests[0];
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeChestId, setActiveChestId] = useState<number | null>(null);

  useEffect(() => {
    if (overlayOpen || treasureLoading || !nextChest || !hasPromoChestReady()) {
      return;
    }

    setActiveChestId(nextChest.id);
    setStarted(false);
    setOverlayOpen(true);
  }, [nextChest, overlayOpen, treasureLoading]);

  const handleStartOpen = async () => {
    if (!activeChestId || treasureOpening) {
      return;
    }

    setStarted(true);
    const opened = await openTreasureChest(activeChestId);

    if (opened) {
      clearPromoChestReady();
      return;
    }

    setStarted(false);
    setOverlayOpen(false);
  };

  const handleClose = () => {
    if (
      started &&
      treasureOpening &&
      (!treasureResult || treasureResult.chestId !== activeChestId)
    ) {
      return;
    }

    clearPromoChestReady();
    setOverlayOpen(false);
  };

  return (
    <TreasureOpeningOverlay
      open={overlayOpen}
      opening={treasureOpening}
      result={treasureResult}
      chestId={activeChestId}
      started={started}
      onStartOpen={handleStartOpen}
      onClose={handleClose}
    />
  );
};
