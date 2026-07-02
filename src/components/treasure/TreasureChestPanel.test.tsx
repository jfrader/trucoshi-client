import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { ITreasureOpenResult, ITreasureStatus } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { TreasureChestPanel, TreasureOpeningOverlay } from "./TreasureChestPanel";

const soundMocks = vi.hoisted(() => ({
  queue: vi.fn(),
}));

vi.mock("../../sound/hooks/useSound", () => ({
  useSound: () => ({
    queue: soundMocks.queue,
  }),
}));

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card, cardSkinId, displayMode, width }: any) => (
    <div
      data-testid={`game-card-${card}`}
      data-card-skin-id={cardSkinId || ""}
      data-display-mode={displayMode}
      data-width={width || ""}
    />
  ),
}));

const readyStatus: ITreasureStatus = {
  progress: 3,
  threshold: 3,
  unopenedChests: [{ id: 11, earnedAt: "2026-07-01T00:00:00.000Z" }],
};

const progressStatus: ITreasureStatus = {
  progress: 1,
  threshold: 3,
  unopenedChests: [],
};

const skinResult: ITreasureOpenResult = {
  chestId: 11,
  granted: true,
  duplicate: false,
  rarity: "RARE" as const,
  cardSkin: {
    id: "argentino/1e_argentino_001",
    release: "argentino",
    card: "1e",
    fileName: "1e_argentino_001.png",
    assetPath: "skins/argentino/1e_argentino_001.png",
    rarity: "RARE" as const,
    enabled: true,
    unlockable: true,
  },
};

const legendarySkinResult: ITreasureOpenResult = {
  ...skinResult,
  rarity: "LEGENDARY" as const,
  cardSkin: {
    ...skinResult.cardSkin!,
    rarity: "LEGENDARY" as const,
  },
};

const renderPanel = ({
  status = readyStatus,
  result = null,
  opening = false,
  onOpenChest = vi.fn(),
  onDevGrantChest,
  onEquipReward,
}: {
  status?: ITreasureStatus;
  result?: ITreasureOpenResult | null;
  opening?: boolean;
  onOpenChest?: (chestId: number) => Promise<boolean> | boolean | void;
  onDevGrantChest?: () => Promise<boolean> | boolean | void;
  onEquipReward?: (
    cardSkin: NonNullable<ITreasureOpenResult["cardSkin"]>,
  ) => Promise<boolean> | boolean | void;
} = {}) =>
  renderWithTheme(
    <TreasureChestPanel
      status={status}
      result={result}
      loading={false}
      opening={opening}
      onOpenChest={onOpenChest}
      onDevGrantChest={onDevGrantChest}
      onEquipReward={onEquipReward}
    />
  );

const finishChestAnimation = () => {
  act(() => {
    vi.advanceTimersByTime(950);
  });
  act(() => {
    vi.advanceTimersByTime(100);
  });
};

describe("TreasureChestPanel", () => {
  beforeEach(() => {
    soundMocks.queue.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  it("renders a compact progress dock before a chest is ready", () => {
    renderPanel({ status: progressStatus });

    expect(screen.getByTestId("treasure-panel")).toHaveAttribute("data-ready", "false");
    expect(screen.getByTestId("treasure-dock")).toBeInTheDocument();
    expect(screen.getByTestId("treasure-progress-row")).toHaveTextContent("Progreso 1/3");
    expect(screen.getByTestId("treasure-panel")).toHaveTextContent("Progreso 1/3");
    expect(screen.getByTestId("treasure-last-result")).toHaveTextContent(
      "Segui jugando para desbloquearlo."
    );
    expect(screen.getByTestId("treasure-action-row")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /abrir cofre/i })).not.toBeInTheDocument();
  });

  it("renders ready, opening, dev, and last-result states without replacing the dock", () => {
    const onDevGrantChest = vi.fn();
    renderPanel({
      opening: true,
      result: skinResult,
      onDevGrantChest,
    });

    expect(screen.getByTestId("treasure-panel")).toHaveAttribute("data-ready", "true");
    expect(screen.getByTestId("treasure-progress-row")).toHaveTextContent("Cofre listo");
    expect(screen.getByTestId("treasure-progress-row")).toHaveTextContent("Abriendo");
    expect(screen.getByRole("button", { name: /abrir cofre/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /dar cofre/i })).toBeDisabled();
    expect(screen.getByTestId("treasure-last-result")).toHaveTextContent("Nueva skin");
    expect(screen.getByTestId("treasure-rarity-RARE")).toHaveAttribute("data-rarity", "RARE");
    expect(within(screen.getByTestId("treasure-action-row")).getByRole("button", { name: /abrir cofre/i })).toBeDisabled();
  });

  it("can equip the latest skin result from the compact result strip and dismisses it", async () => {
    const onEquipReward = vi.fn();
    renderPanel({
      result: {
        ...skinResult,
        granted: false,
        duplicate: true,
      },
      onEquipReward,
    });

    expect(screen.getByTestId("treasure-last-result")).toHaveTextContent("Repetida");

    fireEvent.click(screen.getByRole("button", { name: /equipar/i }));

    expect(onEquipReward).toHaveBeenCalledWith(skinResult.cardSkin);
    expect(soundMocks.queue).toHaveBeenCalledWith("play0");

    await waitFor(() => {
      expect(screen.getByTestId("treasure-last-result")).not.toHaveTextContent("Repetida");
    });
  });

  it("can dismiss the compact result without equipping it", () => {
    const onEquipReward = vi.fn();
    renderPanel({
      result: {
        ...skinResult,
        granted: false,
        duplicate: true,
      },
      onEquipReward,
    });

    fireEvent.click(screen.getByRole("button", { name: /descartar resultado/i }));

    expect(onEquipReward).not.toHaveBeenCalled();
    expect(screen.getByTestId("treasure-last-result")).not.toHaveTextContent("Repetida");
  });

  it("does not render the compact equip action when the result has no skin", () => {
    renderPanel({
      result: {
        chestId: 11,
        granted: false,
        duplicate: false,
        rarity: null,
        cardSkin: null,
      } as ITreasureOpenResult,
      onEquipReward: vi.fn(),
    });

    expect(screen.queryByRole("button", { name: /equipar/i })).not.toBeInTheDocument();
  });

  it("can request a dev chest when the dev action is provided", () => {
    const onDevGrantChest = vi.fn();
    renderPanel({ onDevGrantChest });

    fireEvent.click(screen.getByRole("button", { name: /dar cofre/i }));

    expect(onDevGrantChest).toHaveBeenCalled();
  });

  it("opens a full-viewport portal overlay and advances chest frames deterministically", () => {
    vi.useFakeTimers();
    const onOpenChest = vi.fn();
    renderPanel({ onOpenChest });

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));

    expect(onOpenChest).toHaveBeenCalledWith(11);
    expect(soundMocks.queue).toHaveBeenCalledWith("menu1");
    expect(soundMocks.queue).toHaveBeenCalledWith("shuffle");
    expect(screen.getByTestId("treasure-opening-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("treasure-chest-frame")).toHaveAttribute("data-frame", "0");
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(screen.getByTestId("treasure-chest-frame")).toHaveAttribute("data-frame", "1");

    act(() => {
      vi.advanceTimersByTime(770);
    });
    expect(screen.getByTestId("treasure-chest-frame")).toHaveAttribute("data-frame", "7");
  });

  it("renders the promo overlay idle without advancing chest frames before the open click", () => {
    vi.useFakeTimers();
    const onStartOpen = vi.fn();

    renderWithTheme(
      <TreasureOpeningOverlay
        open
        opening={false}
        result={null}
        chestId={11}
        started={false}
        onStartOpen={onStartOpen}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId("treasure-opening-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("treasure-chest-frame")).toHaveAttribute("data-frame", "0");
    expect(screen.getByRole("button", { name: /abrir cofre/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(950);
    });

    expect(screen.getByTestId("treasure-chest-frame")).toHaveAttribute("data-frame", "0");
    expect(onStartOpen).not.toHaveBeenCalled();
  });

  it("starts the promo overlay animation after the chest button is clicked", () => {
    vi.useFakeTimers();
    const onStartOpen = vi.fn();
    const { rerender } = renderWithTheme(
      <TreasureOpeningOverlay
        open
        opening={false}
        result={null}
        chestId={11}
        started={false}
        onStartOpen={onStartOpen}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));

    expect(onStartOpen).toHaveBeenCalled();
    expect(soundMocks.queue).toHaveBeenCalledWith("menu1");

    rerender(
      <TreasureOpeningOverlay
        open
        opening
        result={null}
        chestId={11}
        started
        onStartOpen={onStartOpen}
        onClose={vi.fn()}
      />
    );

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(soundMocks.queue).toHaveBeenCalledWith("shuffle");
    expect(screen.getByTestId("treasure-chest-frame")).toHaveAttribute("data-frame", "1");
  });

  it("shows an inspect-scale face-down reward card emerging from the chest, then flips automatically", () => {
    vi.useFakeTimers();
    const onOpenChest = vi.fn();
    const { rerender } = renderPanel({ onOpenChest });

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));

    rerender(
      <TreasureChestPanel
        status={readyStatus}
        result={skinResult}
        loading={false}
        opening={false}
        onOpenChest={onOpenChest}
      />
    );

    act(() => {
      vi.advanceTimersByTime(950);
    });

    expect(soundMocks.queue).toHaveBeenCalledWith("notification");
    let rewardPanel = screen.getByTestId("treasure-reward");
    let rewardCard = within(rewardPanel).getByTestId("treasure-reward-card");
    expect(rewardPanel).toHaveAttribute("data-emerged", "false");
    expect(rewardCard).toHaveAttribute("data-reveal-ready", "false");
    expect(rewardCard).toHaveAttribute("data-card-scale", "inspect");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(soundMocks.queue).toHaveBeenCalledWith("winner");
    rewardPanel = screen.getByTestId("treasure-reward");
    rewardCard = within(rewardPanel).getByTestId("treasure-reward-card");
    expect(rewardPanel).toHaveAttribute("data-emerged", "true");
    expect(within(rewardPanel).getByTestId("treasure-result-title")).toHaveTextContent(
      "Nueva skin"
    );
    expect(within(rewardPanel).getByTestId("treasure-rarity-RARE")).toHaveAttribute(
      "data-rarity",
      "RARE"
    );
    expect(rewardCard).toHaveAttribute("data-reveal-ready", "true");
    expect(rewardCard).toHaveAttribute("data-flipped", "false");
    expect(within(rewardCard).getByTestId("game-card-1e")).toHaveAttribute(
      "data-card-skin-id",
      "argentino/1e_argentino_001"
    );
    expect(within(rewardCard).getByTestId("game-card-1e")).toHaveAttribute(
      "data-display-mode",
      "skins"
    );
    expect(within(rewardCard).getByTestId("game-card-1e")).toHaveAttribute(
      "data-width",
      "var(--treasure-reward-card-width)"
    );
    expect(within(rewardCard).queryByRole("button", { name: /listo/i })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(rewardCard).toHaveAttribute("data-flipped", "false");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(rewardCard).toHaveAttribute("data-flipped", "true");
    expect(screen.getByTestId("treasure-done-button")).toBeInTheDocument();
  });

  it("renders legendary rarity as a bright structured badge instead of plain tiny text", () => {
    vi.useFakeTimers();
    renderPanel({ result: legendarySkinResult });

    expect(screen.getByTestId("treasure-last-result")).toHaveTextContent("Legendaria");
    expect(screen.getByTestId("treasure-rarity-LEGENDARY")).toHaveAttribute(
      "data-rarity",
      "LEGENDARY"
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));
    finishChestAnimation();

    expect(within(screen.getByTestId("treasure-reward")).getByTestId("treasure-rarity-LEGENDARY")).toHaveTextContent(
      "Legendaria"
    );
  });

  it("labels duplicate rewards while still showing the skin", () => {
    vi.useFakeTimers();
    renderPanel({
      result: {
        ...skinResult,
        granted: false,
        duplicate: true,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));
    finishChestAnimation();

    expect(soundMocks.queue).toHaveBeenCalledWith("flawless");
    expect(soundMocks.queue).not.toHaveBeenCalledWith("winner");
    expect(screen.getByTestId("treasure-reward")).toHaveTextContent("Repetida");
    expect(within(screen.getByTestId("treasure-reward-card")).getByTestId("game-card-1e")).toHaveAttribute(
      "data-card-skin-id",
      "argentino/1e_argentino_001"
    );
  });

  it("shows a clear empty reward state when no skin is available", () => {
    vi.useFakeTimers();
    renderPanel({
      result: {
        chestId: 11,
        granted: false,
        duplicate: false,
        rarity: null,
        cardSkin: null,
      } as ITreasureOpenResult,
    });

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));
    finishChestAnimation();

    expect(soundMocks.queue).toHaveBeenCalledWith("back");
    expect(screen.getByTestId("treasure-empty-reward")).toHaveTextContent("Sin premio");
    expect(screen.getByTestId("treasure-empty-reward")).toHaveTextContent(
      "No hubo una skin disponible"
    );
  });
});
