import { Box, Paper, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { ICard, IChatMessage, IPublicPlayer } from "trucoshi";
import { getMessageContent } from "../chat/ChatRoom";
import { CommandBar } from "./CommandBar";
import { useBoardLayout, useMatchState } from "../../board";
import { useEffect, useRef, useState } from "react";
import { useMatchGameplay } from "./MatchGameplayContext";
import { PlayableMatchCard } from "./PlayableMatchCard";

const isUnreadChatCandidate = (message: IChatMessage) =>
  Boolean(
    message.content?.trim() &&
      !message.system &&
      !message.hidden &&
      !message.command &&
      !message.card,
  );

const getStatusLabel = (player: IPublicPlayer | null) => {
  if (!player) {
    return "Modo Espectador";
  }

  if (player.abandoned) {
    return "Retirado";
  }

  if (player.disabled) {
    return "Al mazo";
  }

  if (player.isTurn || player.isEnvidoTurn) {
    return "Tu turno";
  }

  return "Esperando oponente";
};

const MatchBottomDockComponent = () => {
  const {
    state: { chatProps, isDesktopChat, canSay, me, hasCommandActions, canInteractWithHand },
    announcements: {
      latestAnnouncement,
      previousAnnouncement,
      thirdAnnouncement,
      latestAnnouncementColor,
      previousAnnouncementColor,
      thirdAnnouncementColor,
      animateAnnouncement,
    },
    actions: { onPlayCard, sayCommand },
  } = useMatchGameplay();
  const match = useMatchState();
  const layout = useBoardLayout();
  const dock = layout.match?.dock;
  const onOpenChat = !isDesktopChat ? () => chatProps.setActive(true) : undefined;
  const room = chatProps.useChatState[0];
  const latestUnreadCandidate =
    [...(room?.messages || [])].reverse().find(isUnreadChatCandidate) || null;
  const latestSeenChatMessageIdRef = useRef<IChatMessage["id"] | null>(null);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const bottomOffset = "env(safe-area-inset-bottom)";
  const isUnavailable = Boolean(me?.disabled || me?.abandoned);
  const showHandPanel = !me?.abandoned;
  const isHandFinished = match?.handState === "DISPLAY_PREVIOUS_HAND";
  const isFolded = Boolean(me?.disabled && !me.abandoned);
  const hand = !isUnavailable ? ((me?.hand || []).slice(0, 3) as ICard[]) : [];
  const handCount = hand.length;
  const fanRotations = handCount === 3 ? [-10, 0, 10] : handCount === 2 ? [-7, 7] : [0];
  const latestAnnouncementText = latestAnnouncement
    ? getMessageContent(latestAnnouncement)
    : "Sin anuncios";
  const previousAnnouncementText = previousAnnouncement
    ? getMessageContent(previousAnnouncement)
    : "-";
  const thirdAnnouncementText = thirdAnnouncement ? getMessageContent(thirdAnnouncement) : "-";
  const statusLabel = getStatusLabel(me);

  const showCommandActions = Boolean(me && hasCommandActions && !isUnavailable);

  useEffect(() => {
    if (isDesktopChat) {
      return;
    }

    if (chatProps.active) {
      latestSeenChatMessageIdRef.current = latestUnreadCandidate?.id || null;
      setHasUnreadChat(false);
      return;
    }

    if (!latestUnreadCandidate?.id) {
      return;
    }

    if (!latestSeenChatMessageIdRef.current) {
      latestSeenChatMessageIdRef.current = latestUnreadCandidate.id;
      return;
    }

    if (latestSeenChatMessageIdRef.current !== latestUnreadCandidate.id) {
      latestSeenChatMessageIdRef.current = latestUnreadCandidate.id;
      setHasUnreadChat(true);
    }
  }, [chatProps.active, isDesktopChat, latestUnreadCandidate]);

  const handleOpenChat = () => {
    latestSeenChatMessageIdRef.current = latestUnreadCandidate?.id || null;
    setHasUnreadChat(false);
    chatProps.setActive(true);
  };

  let handCardsNode = null;

  if (dock && (isHandFinished || isFolded) && me) {
    handCardsNode = (
      <Box
        sx={{
          width: "100%",
          height: `calc(${dock.handCardWidth} * 1.48)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="grey.300" fontSize="0.92rem" fontWeight={700}>
          {isHandFinished ? "Mano finalizada" : "Al mazo"}
        </Typography>
      </Box>
    );
  } else if (dock && (!showHandPanel || !handCount)) {
    handCardsNode = (
      <Box
        sx={{
          width: dock.handCardWidth,
          height: `calc(${dock.handCardWidth} * 1.48)`,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />
    );
  } else if (dock) {
    handCardsNode = hand.map((card, idx) => (
      <PlayableMatchCard
        key={`${card}-${idx}`}
        card={card}
        cardIdx={idx}
        canPlay={canInteractWithHand}
        overlap={idx ? -1.32 : 0}
        rotation={fanRotations[idx] || 0}
        width={dock.handCardWidth}
        onPlayIntent={onPlayCard}
      />
    ));
  }

  if (!dock) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        zIndex: theme.zIndex.fab,
        px: { xs: 0, sm: 0.35, md: 0.4, lg: 1 },
        pointerEvents: "auto",
      })}
    >
      <Stack spacing={dock.dockGap}>
        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.announcementPanel,
            py: 0.5,
            px: 0.95,
            position: "relative",
            animation: animateAnnouncement ? "annAboveCardsPulse 520ms ease-out" : "none",
            "@keyframes annAboveCardsPulse": {
              "0%": { transform: "translateY(6px)", opacity: 0.65 },
              "50%": { transform: "translateY(0)", opacity: 1 },
              "100%": { transform: "translateY(0)", opacity: 1 },
            },
          })}
        >
          <Box
            sx={{
              minWidth: 0,
              px: onOpenChat
                ? {
                    xs: layout.profile === "phoneWide" ? "2.8rem" : "3rem",
                    sm: "3.1rem",
                  }
                : 0,
            }}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              fontSize={dock.announcementTextSizes.tertiary}
              lineHeight={1.15}
              color={thirdAnnouncementColor}
            >
              {thirdAnnouncementText}
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              fontSize={dock.announcementTextSizes.secondary}
              lineHeight={1.15}
              color={previousAnnouncementColor}
            >
              {previousAnnouncementText}
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              fontSize={dock.announcementTextSizes.primary}
              lineHeight={1.18}
              color={latestAnnouncementColor}
            >
              {latestAnnouncementText}
            </Typography>
          </Box>

          {onOpenChat ? (
            <Box
              component="button"
              type="button"
              onClick={handleOpenChat}
              aria-label="Abrir chat"
              sx={(theme) => ({
                ...theme.trucoshiUi.match.dockChatButton,
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                borderRadius: "0.68rem",
                minWidth: layout.profile === "phoneWide" ? "2.6rem" : "2.85rem",
                height: "calc(100% - 0.48rem)",
                px: layout.profile === "phoneWide" ? 0.18 : 0.35,
                borderWidth: 1,
                fontWeight: 900,
                fontSize: "0.66rem",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.12,
                cursor: "pointer",
                "&:active": {
                  transform: "translateY(calc(-50% + 1px))",
                },
              })}
            >
              {hasUnreadChat ? (
                <Box
                  data-testid="mobile-chat-unread-dot"
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: "warning.main",
                    border: "2px solid rgba(20,18,14,0.94)",
                    boxShadow: "0 0 0 2px rgba(255,189,74,0.24)",
                  }}
                />
              ) : null}
              <ChatBubbleOutlineIcon sx={{ fontSize: "1.06rem" }} />
              <Box component="span">Chat</Box>
            </Box>
          ) : null}
        </Paper>

        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.dockShell,
          })}
        >
          <Box
            sx={{
              pt:
                layout.profile === "desktop" || layout.profile === "tabletWide"
                  ? 0.3
                  : layout.profile === "phoneWide"
                    ? 0.22
                    : 0.42,
              px: layout.profile === "desktop" || layout.profile === "tabletWide" ? 0.45 : 0.58,
              pb: layout.profile === "phoneWide" ? 0.08 : 0.28,
              minHeight: dock.handBlockHeight,
              maxHeight: dock.handBlockHeight,
              overflow: "visible",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="flex-end"
              sx={{
                minHeight: dock.handRowMinHeight,
                transform: `translateY(${dock.handRowTranslateY})`,
                overflow: "visible",
              }}
            >
              {handCardsNode}
            </Stack>
          </Box>

          <Box sx={(theme) => theme.trucoshiUi.match.dockDivider} />

          <Box
            sx={(theme) => ({
              ...theme.trucoshiUi.match.dockCommandLane,
              height: dock.commandBlockHeight,
              minHeight: dock.commandBlockHeight,
              maxHeight: dock.commandBlockHeight,
              px: 0.42,
              py: 0.26,
              display: "flex",
              alignItems: "stretch",
              gap: 0.42,
              position: "relative",
              zIndex: 3,
            })}
          >
            <Box sx={{ height: "100%", flex: 1, minWidth: 0 }}>
              <CommandBar
                canSay={canSay}
                onSayCommand={sayCommand}
                player={me}
                compact={dock.commandCompact}
                showActions={showCommandActions}
                statusLabel={statusLabel}
                embedded
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
};

export const MatchBottomDock = MatchBottomDockComponent;
