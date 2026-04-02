import { Box, Paper, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { ICard, IChatMessage, IPublicPlayer } from "trucoshi";
import { getMessageContent } from "../chat/ChatRoom";
import { ITrucoshiMatchActions } from "../../trucoshi/types";
import { GameCard } from "../card/GameCard";
import { CommandBar } from "./CommandBar";
import { BoardLayoutModel } from "./boardLayoutPresets";
import { memo, useMemo } from "react";

type MatchBottomDockProps = {
  layout: BoardLayoutModel;
  latestAnnouncement: IChatMessage | null;
  previousAnnouncement: IChatMessage | null;
  thirdAnnouncement: IChatMessage | null;
  latestAnnouncementColor: string;
  previousAnnouncementColor: string;
  thirdAnnouncementColor: string;
  animateAnnouncement: boolean;
  me: IPublicPlayer | null;
  canSay: boolean;
  hasCommandActions: boolean;
  canInteractWithHand: boolean;
  onPlayCard: (card: ICard, cardIdx: number) => void;
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
  onOpenChat?: () => void;
  bottomOffsetOverride?: string;
};

const _MatchBottomDock = ({
  layout,
  latestAnnouncement,
  previousAnnouncement,
  thirdAnnouncement,
  latestAnnouncementColor,
  previousAnnouncementColor,
  thirdAnnouncementColor,
  animateAnnouncement,
  me,
  canSay,
  hasCommandActions,
  canInteractWithHand,
  onPlayCard,
  onSayCommand,
  onOpenChat,
  bottomOffsetOverride,
}: MatchBottomDockProps) => {
  const dock = layout.match?.dock;
  const isUnavailable = Boolean(me?.disabled || me?.abandoned);
  const showHandPanel = !me?.abandoned;
  const hand = useMemo(
    () => (!isUnavailable ? ((me?.hand || []).slice(0, 3) as ICard[]) : []),
    [isUnavailable, me?.hand]
  );
  const handCount = hand.length;
  const fanRotations = useMemo(
    () => (handCount === 3 ? [-10, 0, 10] : handCount === 2 ? [-7, 7] : [0]),
    [handCount]
  );
  const latestAnnouncementText = useMemo(
    () => (latestAnnouncement ? getMessageContent(latestAnnouncement) : "Sin anuncios"),
    [latestAnnouncement]
  );
  const previousAnnouncementText = useMemo(
    () => (previousAnnouncement ? getMessageContent(previousAnnouncement) : "Anterior: sin datos"),
    [previousAnnouncement]
  );
  const thirdAnnouncementText = useMemo(
    () => (thirdAnnouncement ? getMessageContent(thirdAnnouncement) : "Anterior: sin datos"),
    [thirdAnnouncement]
  );
  const statusLabel = useMemo(
    () =>
      me
        ? me.abandoned
          ? "Retirado"
          : me.disabled
          ? "Al mazo"
          : "Esperando jugada"
        : "Modo espectador",
    [me]
  );
  const showCommandActions = Boolean(me && hasCommandActions && !isUnavailable);
  const handCardsNode = useMemo(() => {
    if (!dock) {
      return null;
    }

    if (!showHandPanel || !handCount) {
      return (
        <Box
          sx={{
            width: dock.handCardWidth,
            height: `calc(${dock.handCardWidth} * 1.48)`,
            visibility: "hidden",
            pointerEvents: "none",
          }}
        />
      );
    }

    return hand.map((card, idx) => {
      const rotation = fanRotations[idx] || 0;

      return (
        <Box
          key={`${card}-${idx}`}
          className={canInteractWithHand ? "truco-play-card-interactive" : undefined}
          ml={idx ? -1.32 : 0}
          sx={{
            transform: `rotate(${rotation}deg) translateY(${Math.abs(rotation) > 0 ? "2px" : "0"})`,
            transformOrigin: "bottom center",
            position: "relative",
          }}
        >
          <GameCard
            card={card}
            width={dock.handCardWidth}
            shadow
            enableHover={canInteractWithHand}
            disabledMask={!canInteractWithHand}
            onClick={() => canInteractWithHand && onPlayCard(card, idx)}
          />
        </Box>
      );
    });
  }, [canInteractWithHand, dock, fanRotations, hand, handCount, onPlayCard, showHandPanel]);

  if (!dock) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffsetOverride || dock.dockBottomOffset,
        zIndex: theme.zIndex.fab,
        px: { xs: 0.35, sm: 0.6 },
        pointerEvents: "auto",
      })}
    >
      <Stack spacing={dock.dockGap}>
        <Paper
          sx={(theme) => ({
            ...theme.trucoshiUi.match.announcementPanel,
            py: layout.profile === "phoneWide" ? 0.5 : 0.68,
            px: 0.95,
            minHeight: dock.announcementBlockHeight,
            maxHeight: dock.announcementBlockHeight,
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
                color={thirdAnnouncementColor}
                sx={{
                  mt: 0.02,
                  fontSize: { xs: "0.88rem", sm: "0.8rem" },
                  lineHeight: 1.08,
                  textAlign: "center",
                  fontWeight: 600,
                  opacity: thirdAnnouncement ? 0.88 : 0.45,
                  visibility: thirdAnnouncement ? "visible" : "hidden",
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {thirdAnnouncementText}
              </Typography>

              <Typography
                color={previousAnnouncementColor}
                sx={{
                  mt: 0.16,
                  fontSize: { xs: "1rem", sm: "0.9rem" },
                  lineHeight: 1.1,
                  textAlign: "center",
                  fontWeight: 600,
                  opacity: 0.96,
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {previousAnnouncementText}
              </Typography>

              <Typography
                fontWeight={900}
                color={latestAnnouncementColor}
                sx={{
                  mt: 0.2,
                  fontSize: { xs: "1.24rem", sm: "1.08rem" },
                  lineHeight: 1.05,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {latestAnnouncementText}
              </Typography>
          </Box>

          {onOpenChat ? (
            <Box
              component="button"
              type="button"
              onClick={onOpenChat}
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
                onSayCommand={onSayCommand}
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

export const MatchBottomDock = memo(_MatchBottomDock);
