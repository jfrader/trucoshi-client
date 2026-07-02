import { Box, Button, ButtonBase, CircularProgress, Stack, Typography } from "@mui/material";
import { CheckCircle, Lock, Style } from "@mui/icons-material";
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CARDS_HUMAN_READABLE, ICard, ITreasureOpenResult } from "trucoshi";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../shared/PageContainer";
import { GameCard } from "../card/GameCard";
import { CardDisplayModeToggle } from "../card/CardDisplayModeToggle";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import {
  CardSkinId,
  INVENTORY_CARDS,
  IInventoryCardGroup,
} from "../../trucoshi/cards/skinRegistry";
import { TreasureChestPanel } from "../treasure/TreasureChestPanel";
import { useSound } from "../../sound/hooks/useSound";

type StackChoice = {
  key: string;
  cardSkinId: CardSkinId | null;
  defaultChoice: boolean;
  selected: boolean;
  unlocked: boolean;
};

const CARD_WIDTH = "var(--inventory-card-width)";
const OPEN_CARD_WIDTH = "var(--inventory-open-card-width)";
const MAX_COLLAPSED_PREVIEW = 3;
const LONG_TOUCH_MS = 550;

const gridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 11rem), 1fr))",
  columnGap: { xs: 1.45, sm: 2.15, md: 2.65 },
  rowGap: { xs: 1.85, sm: 2.55, md: 3.1 },
  alignItems: "stretch",
  overflow: "visible",
};

const getCardLabel = (card: ICard) => CARDS_HUMAN_READABLE[card] || card;

const orderStackChoices = (choices: StackChoice[]) => {
  const selectedChoice = choices.find((choice) => choice.selected);
  const unlockedSkins = choices.filter(
    (choice) => !choice.defaultChoice && choice.unlocked && !choice.selected,
  );
  const defaultChoice = choices.find((choice) => choice.defaultChoice && !choice.selected);
  const lockedChoices = choices.filter((choice) => !choice.unlocked && !choice.selected);

  return [selectedChoice, ...unlockedSkins, defaultChoice, ...lockedChoices].filter(
    Boolean,
  ) as StackChoice[];
};

const getStackChoices = (group?: IInventoryCardGroup): StackChoice[] => {
  const equippedCardSkinId = group?.equippedCardSkinId;
  const choices: StackChoice[] = [
    {
      key: "default",
      cardSkinId: null,
      defaultChoice: true,
      selected: !equippedCardSkinId,
      unlocked: true,
    },
    ...(group?.skins || []).map((skin) => ({
      key: skin.id,
      cardSkinId: skin.id,
      defaultChoice: false,
      selected: equippedCardSkinId === skin.id,
      unlocked: skin.unlocked,
    })),
  ];
  return orderStackChoices(choices);
};

const getPreviewChoiceTransform = (index: number) => {
  const x = index * 9;
  const y = index * -6;
  const rotation = index * 4;
  const scale = 1 - index * 0.025;
  return `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg) scale(${scale})`;
};

const getSelectorChoicePosition = (index: number, total: number) => {
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const spread = total <= 2 ? 18 : total === 3 ? 15.5 : total === 4 ? 12.5 : 10;
  const y = Math.abs(offset) * 9;
  const rotation = offset * 8;

  return {
    left: `calc(50% + ${offset * spread}%)`,
    transform: `translate(-50%, -50%) translateY(${y}px) rotate(${rotation}deg)`,
    hoverTransform: `translate(-50%, -50%) translateY(${y - 12}px) rotate(${rotation}deg) scale(1.035)`,
  };
};

const InventoryCardStack = ({
  card,
  group,
  open,
  saving,
  onOpen,
  onClose,
  onSelect,
  onInspect,
}: {
  card: ICard;
  group?: IInventoryCardGroup;
  open: boolean;
  saving: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (card: ICard, cardSkinId: CardSkinId | null) => void;
  onInspect: (card: ICard) => void;
}) => {
  const choices = getStackChoices(group);
  const hasVariants = choices.length > 1;
  const cardLabel = getCardLabel(card);
  const previewCount = Math.min(Math.max(choices.length - 1, 0), MAX_COLLAPSED_PREVIEW);
  const longTouchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longTouchTriggered = useRef(false);

  useEffect(
    () => () => {
      if (longTouchTimer.current) {
        clearTimeout(longTouchTimer.current);
      }
    },
    [],
  );

  const handleChoiceClick = (event: MouseEvent<HTMLButtonElement>, choice: StackChoice) => {
    event.preventDefault();
    event.stopPropagation();

    if (longTouchTriggered.current) {
      longTouchTriggered.current = false;
      return;
    }

    if (event.detail > 1 || saving || !choice.unlocked) {
      return;
    }

    if (!open && hasVariants) {
      onOpen();
      return;
    }

    if (choice.selected) {
      return;
    }

    onSelect(card, choice.cardSkinId);
  };

  const handleChoiceDoubleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onInspect(card);
  };

  const handleChoiceContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onInspect(card);
  };

  const handleChoiceTouchStart = (event: TouchEvent<HTMLButtonElement>, choice: StackChoice) => {
    if (saving || !choice.unlocked) {
      return;
    }

    event.stopPropagation();
    longTouchTriggered.current = false;

    if (longTouchTimer.current) {
      clearTimeout(longTouchTimer.current);
    }

    longTouchTimer.current = setTimeout(() => {
      longTouchTriggered.current = true;
      onInspect(card);
    }, LONG_TOUCH_MS);
  };

  const clearLongTouch = () => {
    if (longTouchTimer.current) {
      clearTimeout(longTouchTimer.current);
      longTouchTimer.current = null;
    }
  };

  const renderChoiceButton = ({
    choice,
    index,
    selector = false,
  }: {
    choice: StackChoice;
    index: number;
    selector?: boolean;
  }) => {
    const selectedUnlockedChoice = choice.selected && choice.unlocked;
    const disabled = saving || !choice.unlocked;
    const choiceWidth = selector ? OPEN_CARD_WIDTH : CARD_WIDTH;
    const choiceId = choice.defaultChoice ? "default" : index;
    const selectorPosition = selector ? getSelectorChoicePosition(index, choices.length) : null;
    const selectorLayer = choices.length - index + (choice.selected ? choices.length : 0);

    return (
      <ButtonBase
        key={`${selector ? "selector" : "stack"}-${choice.key}`}
        aria-label={`Elegir variante ${index + 1} de ${choices.length} para ${cardLabel}`}
        aria-pressed={choice.selected}
        data-testid={`inventory-${selector ? "selector" : "stack"}-choice-${card}-${choiceId}`}
        data-size={selector ? "large" : "normal"}
        data-selected={choice.selected ? "true" : "false"}
        data-card-width={choiceWidth}
        data-stack-index={index}
        disabled={disabled}
        onClick={(event) => handleChoiceClick(event, choice)}
        onContextMenu={handleChoiceContextMenu}
        onDoubleClick={handleChoiceDoubleClick}
        onTouchStart={(event) => handleChoiceTouchStart(event, choice)}
        onTouchEnd={clearLongTouch}
        onTouchCancel={clearLongTouch}
        sx={(theme) => ({
          position: "absolute",
          left: selectorPosition?.left || "50%",
          top: selector ? "50%" : "47%",
          width: choiceWidth,
          height: `calc(${choiceWidth} * 1.48)`,
          borderRadius: `calc(${choiceWidth} / 13)`,
          opacity: choice.unlocked ? 1 : 0.45,
          pointerEvents: "auto",
          transform: selectorPosition?.transform || getPreviewChoiceTransform(index),
          transformOrigin: "50% 100%",
          transition: theme.transitions.create(["transform", "opacity", "filter"], {
            duration: theme.transitions.duration.short,
          }),
          zIndex: selector ? selectorLayer : 80 - index,
          filter: disabled && !saving ? "grayscale(0.75)" : "none",
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.warning.main}`,
            outlineOffset: 3,
            zIndex: 180,
          },
          "@media (hover: hover) and (pointer: fine)": {
            "&:hover": selector
              ? {
                  transform:
                    choice.unlocked && selectorPosition
                      ? selectorPosition.hoverTransform
                      : selectorPosition?.transform,
                  zIndex: choices.length * 2 + 1,
                }
              : {},
          },
        })}
      >
        <GameCard
          disableButton
          disabledMask={!choice.unlocked}
          card={card}
          cardSkinId={choice.cardSkinId || undefined}
          displayMode={choice.defaultChoice ? "default" : "skins"}
          width={choiceWidth}
          shadow={choice.selected || selector}
        />
        {selectedUnlockedChoice ? (
          <CheckCircle
            color="success"
            data-position="left"
            data-testid={`inventory-${selector ? "selector" : "stack"}-selected-${card}-${choiceId}`}
            sx={{
              position: "absolute",
              left: selector ? -12 : -10,
              bottom: selector ? -12 : -10,
              fontSize: selector
                ? { xs: "1.5rem", sm: "1.65rem" }
                : { xs: "1.35rem", sm: "1.45rem" },
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
            }}
          />
        ) : null}
        {!choice.unlocked ? (
          <Lock
            color="disabled"
            sx={{
              position: "absolute",
              right: selector ? -12 : -10,
              bottom: selector ? -12 : -10,
              fontSize: selector
                ? { xs: "1.5rem", sm: "1.65rem" }
                : { xs: "1.35rem", sm: "1.45rem" },
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
            }}
          />
        ) : null}
      </ButtonBase>
    );
  };

  const selector =
    open && hasVariants && typeof document !== "undefined"
      ? createPortal(
          <Box
            data-fit="fan-clamp"
            data-layout="viewport-hand"
            data-testid={`inventory-skin-selector-${card}`}
            onClick={(event) => event.stopPropagation()}
            sx={(theme) => ({
              position: "fixed",
              inset: 0,
              zIndex: theme.zIndex.modal + 4,
              pointerEvents: "none",
              "--inventory-open-card-width": "clamp(7.2rem, min(26vw, 27dvh), 12.8rem)",
            })}
          >
            <Box
              data-testid={`inventory-skin-selector-hand-${card}`}
              sx={{
                position: "absolute",
                left: "50%",
                top: "52%",
                width: "min(98vw, 58rem)",
                height: "calc(var(--inventory-open-card-width) * 1.48 + 5rem)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              {choices.map((choice, index) =>
                renderChoiceButton({ choice, index, selector: true }),
              )}
            </Box>
            <Button
              color="warning"
              data-testid={`inventory-skin-selector-accept-${card}`}
              disabled={saving}
              onClick={onClose}
              size="large"
              variant="contained"
              sx={(theme) => ({
                position: "absolute",
                left: "50%",
                bottom: "calc(env(safe-area-inset-bottom) + 1.25rem)",
                transform: "translateX(-50%)",
                pointerEvents: "auto",
                minWidth: "9rem",
                fontWeight: 900,
                boxShadow: theme.shadows[8],
              })}
            >
              Aceptar
            </Button>
          </Box>,
          document.body,
        )
      : null;

  return (
    <>
      <Box
        data-testid={`inventory-stack-${card}`}
        data-open={open ? "true" : "false"}
        data-preview-count={previewCount}
        sx={(theme) => ({
          position: "relative",
          height: "calc(var(--inventory-card-width) * 1.48 + 1.9rem)",
          overflow: "visible",
          opacity: open ? 0 : 1,
          zIndex: 1,
          transition: theme.transitions.create("opacity", {
            duration: theme.transitions.duration.shortest,
          }),
        })}
      >
        {choices
          .slice(0, previewCount + 1)
          .map((choice, index) => renderChoiceButton({ choice, index }))}
        {saving ? (
          <CircularProgress
            size={24}
            color="warning"
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              mt: "-12px",
              ml: "-12px",
              zIndex: 140,
            }}
          />
        ) : null}
      </Box>
      {selector}
    </>
  );
};

const InventoryCardTile = ({
  card,
  group,
  open,
  saving,
  onOpen,
  onClose,
  onSelect,
  onInspect,
}: {
  card: ICard;
  group?: IInventoryCardGroup;
  open: boolean;
  saving: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (card: ICard, cardSkinId: CardSkinId | null) => void;
  onInspect: (card: ICard) => void;
}) => {
  const cardLabel = getCardLabel(card);
  const choices = getStackChoices(group);
  const hasVariants = choices.length > 1;
  const hasEquippedSkin = Boolean(group?.equippedCardSkinId);
  const skinCount = group?.skins.length || 0;

  return (
    <Box
      data-testid={`inventory-card-${card}`}
      sx={(theme) => ({
        position: "relative",
        minHeight: "calc(var(--inventory-card-width) * 1.48 + 4rem)",
        borderRadius: 1,
        p: { xs: 1.05, sm: 1.2 },
        overflow: "visible",
        background: "transparent",
        border: "none",
        transition: theme.transitions.create("transform", {
          duration: theme.transitions.duration.short,
        }),
        zIndex: 1,
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            transform: open && hasVariants ? "translateY(-2px)" : "none",
          },
        },
      })}
    >
      <InventoryCardStack
        card={card}
        group={group}
        open={open}
        saving={saving}
        onOpen={onOpen}
        onClose={onClose}
        onSelect={onSelect}
        onInspect={onInspect}
      />
      {skinCount ? (
        <Typography
          data-testid={`inventory-skin-count-${card}`}
          aria-label={`${skinCount} skins`}
          variant="caption"
          color="warning.light"
          fontWeight={900}
          sx={(theme) => ({
            ...theme.trucoshiUi.inventory.countBadge,
            position: "absolute",
            top: { xs: 9, sm: 10 },
            left: { xs: 11, sm: 13 },
            zIndex: open ? 1 : 4,
          })}
        >
          {skinCount}
        </Typography>
      ) : null}
      <Stack
        direction="row"
        gap={0.55}
        alignItems="center"
        justifyContent="center"
        minWidth={0}
        mt={0.25}
      >
        {hasEquippedSkin ? (
          <CheckCircle color="success" sx={{ fontSize: { xs: "1.1rem", sm: "1.18rem" } }} />
        ) : null}
        <Typography
          variant="body1"
          fontWeight={900}
          title={cardLabel}
          textAlign="center"
          noWrap
          sx={(theme) => theme.trucoshiUi.inventory.cardLabel}
        >
          {cardLabel}
        </Typography>
      </Stack>
    </Box>
  );
};

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { queue } = useSound();
  const [
    {
      account,
      isAccountPending,
      inventory,
      inventoryLoading,
      treasureStatus,
      treasureLoading,
      treasureOpening,
      treasureResult,
    },
    {
      devGrantTreasureChest,
      fetchInventory,
      fetchTreasureStatus,
      inspectCard,
      openTreasureChest,
      setDeckCardSkin,
    },
  ] = useTrucoshi();
  const [openCard, setOpenCard] = useState<ICard | null>(null);
  const [savingCard, setSavingCard] = useState<ICard | null>(null);

  useEffect(() => {
    if (isAccountPending) {
      return;
    }

    if (!account) {
      navigate("/login");
      return;
    }

    fetchInventory();
    fetchTreasureStatus();
  }, [account, fetchInventory, fetchTreasureStatus, isAccountPending, navigate]);

  const inventoryByCard = inventory.reduce<Record<string, IInventoryCardGroup>>((acc, group) => {
    acc[group.card] = group;
    return acc;
  }, {});

  const handleOpenCard = (card: ICard) => {
    queue("menu0");
    setOpenCard(card);
  };

  const handleCloseCard = () => {
    if (openCard) {
      queue("back");
    }
    setOpenCard(null);
  };

  const selectSkin = async (card: ICard, cardSkinId: CardSkinId | null) => {
    queue("play0");
    setSavingCard(card);
    await setDeckCardSkin(card, cardSkinId);
    setSavingCard(null);
  };

  const equipReward = (cardSkin: NonNullable<ITreasureOpenResult["cardSkin"]>) => {
    return setDeckCardSkin(cardSkin.card, cardSkin.id);
  };

  return (
    <PageContainer
      maxWidth={false}
      title="Inventario"
      icon={null}
      sx={(theme) => theme.trucoshiUi.inventory.pageShell}
    >
      <Box
        data-testid="inventory-hover-overlay"
        data-active={openCard ? "true" : "false"}
        onClick={handleCloseCard}
        sx={(theme) => ({
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.95)",
          opacity: openCard ? 1 : 0,
          pointerEvents: openCard ? "auto" : "none",
          transition: theme.transitions.create("opacity", {
            duration: theme.transitions.duration.short,
          }),
          zIndex: theme.zIndex.modal - 1,
        })}
      />
      <Stack
        data-testid="inventory-page-shell"
        spacing={{ xs: 2.2, sm: 2.55 }}
        sx={{
          "--inventory-card-width": { xs: "5.65rem", sm: "6.2rem", md: "6.85rem", lg: "7.25rem" },
          "--inventory-open-card-width": "clamp(7.6rem, min(31vw, 27dvh), 13.5rem)",
        }}
      >
        <Box
          data-testid="inventory-top-row"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(26rem, 0.92fr)" },
            alignItems: "stretch",
            gap: { xs: 2.2, sm: 2.55, lg: 2 },
          }}
        >
          <Stack
            data-testid="inventory-game-header"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            sx={(theme) => ({
              ...theme.trucoshiUi.inventory.surfaceFrame,
              ...theme.trucoshiUi.inventory.pageHeader,
              height: "100%",
            })}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                borderRadius: "0.9rem",
                bgcolor: "rgba(255,193,7,0.12)",
                color: "warning.light",
                flexShrink: 0,
              }}
            >
              <Style fontSize="medium" />
            </Box>
            <Stack direction="column" alignItems="center" flexGrow={1}>
              <Typography
                variant="h4"
                fontWeight={950}
                sx={{ fontSize: { xs: "1.55rem", sm: "2rem", lg: "2.35rem" }, lineHeight: 1.02 }}
              >
                Arma tu mazo
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={750}
                sx={{
                  fontSize: { xs: "0.98rem", sm: "1.08rem", lg: "1.16rem" },
                  lineHeight: 1.25,
                  mt: 0.3,
                }}
              >
                Las cartas que ven los demas cuando jugas.
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
              {inventoryLoading ? <CircularProgress size={28} color="warning" /> : null}
              <Box
                sx={(theme) => ({
                  "& .MuiIconButton-root": theme.trucoshiUi.inventory.displayTool,
                })}
              >
                <CardDisplayModeToggle />
              </Box>
            </Stack>
          </Stack>

          <TreasureChestPanel
            status={treasureStatus}
            result={treasureResult}
            loading={treasureLoading}
            opening={treasureOpening}
            onOpenChest={openTreasureChest}
            onDevGrantChest={devGrantTreasureChest}
            onEquipReward={equipReward}
          />
        </Box>

        <Box data-testid="inventory-grid" sx={gridSx}>
          {INVENTORY_CARDS.map((card) => (
            <InventoryCardTile
              key={card}
              card={card}
              group={inventoryByCard[card]}
              open={openCard === card}
              saving={savingCard === card}
              onOpen={() => handleOpenCard(card)}
              onClose={() => {
                if (openCard === card) {
                  handleCloseCard();
                }
              }}
              onSelect={selectSkin}
              onInspect={inspectCard}
            />
          ))}
        </Box>
      </Stack>
    </PageContainer>
  );
};
