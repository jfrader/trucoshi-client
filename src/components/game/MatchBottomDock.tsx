import { Box, Paper, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { ICard, IChatMessage, IPublicPlayer } from "trucoshi";
import { getMessageContent } from "../chat/ChatRoom";
import { ITrucoshiMatchActions } from "../../trucoshi/types";
import { GameCard } from "../card/GameCard";
import { CommandBar } from "./CommandBar";
import { BoardLayoutModel } from "./boardLayoutPresets";

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

export const MatchBottomDock = ({
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

  if (!dock) {
    return null;
  }

  const isUnavailable = Boolean(me?.disabled || me?.abandoned);
  const showHandPanel = !me?.abandoned;
  const hand = !isUnavailable ? ((me?.hand || []).slice(0, 3) as ICard[]) : [];
  const handCount = hand.length;
  const fanRotations = handCount === 3 ? [-10, 0, 10] : handCount === 2 ? [-7, 7] : [0];

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
        <Stack direction="row" spacing={0.5}>
          <Paper
            sx={(theme) => ({
              ...theme.trucoshiUi.match.announcementPanel,
              py: layout.profile === "phoneWide" ? 0.5 : 0.68,
              px: 0.95,
              minHeight: dock.announcementBlockHeight,
              maxHeight: dock.announcementBlockHeight,
              flex: 1,
              animation: animateAnnouncement ? "annAboveCardsPulse 520ms ease-out" : "none",
              "@keyframes annAboveCardsPulse": {
                "0%": { transform: "translateY(6px)", opacity: 0.65 },
                "50%": { transform: "translateY(0)", opacity: 1 },
                "100%": { transform: "translateY(0)", opacity: 1 },
              },
            })}
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
              {thirdAnnouncement ? getMessageContent(thirdAnnouncement) : "Anterior: sin datos"}
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
              {previousAnnouncement ? getMessageContent(previousAnnouncement) : "Anterior: sin datos"}
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
              {latestAnnouncement ? getMessageContent(latestAnnouncement) : "Sin anuncios"}
            </Typography>
          </Paper>

          {onOpenChat ? (
            <Paper
              sx={(theme) => ({
                border: theme.trucoshiUi.chatDrawer.actionButtonBorder,
                background: theme.trucoshiUi.chatDrawer.actionButtonBackground,
                boxShadow: theme.trucoshiUi.chatDrawer.actionButtonShadow,
                minHeight: dock.announcementBlockHeight,
                maxHeight: dock.announcementBlockHeight,
                minWidth: layout.profile === "phoneWide" ? "2.65rem" : "2.9rem",
                borderRadius: "0.82rem",
                display: "flex",
                alignItems: "stretch",
              })}
            >
              <Box
                component="button"
                onClick={onOpenChat}
                aria-label="Abrir chat"
                sx={(theme) => ({
                  border: 0,
                  width: "100%",
                  borderRadius: "inherit",
                  cursor: "pointer",
                  color: theme.palette.common.white,
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.25,
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  "&:active": {
                    transform: "translateY(1px)",
                  },
                })}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: "1.2rem" }} />
                <Box component="span">Chat</Box>
              </Box>
            </Paper>
          ) : null}
        </Stack>

        {showHandPanel ? (
          <Paper
            sx={(theme) => ({
              ...theme.trucoshiUi.match.handPanel,
              pt:
                layout.profile === "desktop" || layout.profile === "tabletWide"
                  ? 0.32
                  : layout.profile === "phoneWide"
                  ? 0.26
                  : 0.48,
              px: layout.profile === "desktop" || layout.profile === "tabletWide" ? 0.45 : 0.58,
              pb: layout.profile === "phoneWide" ? 0.12 : 0.38,
              minHeight: dock.handBlockHeight,
              maxHeight: dock.handBlockHeight,
              overflow: "visible",
            })}
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
              {!handCount ? (
                <Box
                  sx={{
                    width: dock.handCardWidth,
                    height: `calc(${dock.handCardWidth} * 1.48)`,
                    visibility: "hidden",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                hand.map((card, idx) => {
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
                })
              )}
            </Stack>
          </Paper>
        ) : null}

        <Box
          sx={{
            height: dock.commandBlockHeight,
            minHeight: dock.commandBlockHeight,
            maxHeight: dock.commandBlockHeight,
          }}
        >
          <Box sx={{ height: "100%" }}>
            <CommandBar
              canSay={canSay}
              onSayCommand={onSayCommand}
              player={me}
              compact={dock.commandCompact}
              showActions={Boolean(me && hasCommandActions && !isUnavailable)}
              statusLabel={
                me
                  ? me.abandoned
                    ? "Retirado"
                    : me.disabled
                    ? "Al mazo"
                    : "Esperando jugada"
                  : "Modo espectador"
              }
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
