import { Box, Paper, Stack, Typography } from "@mui/material";
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
        bottom: dock.dockBottomOffset,
        zIndex: theme.zIndex.drawer + 1,
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

        {showHandPanel ? (
          <Paper
            sx={(theme) => ({
              ...theme.trucoshiUi.match.handPanel,
              pt: layout.profile === "desktop" || layout.profile === "tabletWide" ? 0.32 : 0.48,
              px: layout.profile === "desktop" || layout.profile === "tabletWide" ? 0.45 : 0.58,
              pb: layout.profile === "phoneWide" ? 0.26 : 0.38,
              minHeight: dock.handBlockHeight,
              maxHeight: dock.handBlockHeight,
            })}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="flex-end"
              sx={{
                minHeight: dock.handRowMinHeight,
                transform: `translateY(${dock.handRowTranslateY})`,
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
                        onClick={() => canInteractWithHand && onPlayCard(card, idx)}
                      />
                      {!canInteractWithHand ? (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "0.42rem",
                            border: "1px solid rgba(255,255,255,0.14)",
                            bgcolor: "rgba(7, 10, 9, 0.42)",
                            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.22)",
                            pointerEvents: "none",
                          }}
                        />
                      ) : null}
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
          {me && hasCommandActions && !isUnavailable ? (
            <Box sx={{ height: "100%" }}>
              <CommandBar
                canSay={canSay}
                onSayCommand={onSayCommand}
                player={me}
                compact={dock.commandCompact}
              />
            </Box>
          ) : me ? (
            <Paper
              sx={(theme) => ({
                ...theme.trucoshiUi.match.waitingPanel,
                py: 0.52,
                px: 1,
                textAlign: "center",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              {me.abandoned ? (
                <Typography fontSize="0.82rem" color="text.disabled" fontWeight={700}>
                  Retirado
                </Typography>
              ) : me.disabled ? (
                <Typography fontSize="0.82rem" color="text.disabled" fontWeight={700}>
                  Al mazo
                </Typography>
              ) : (
                <Typography fontSize="0.82rem" color="grey.300" fontWeight={600}>
                  Esperando jugada
                </Typography>
              )}
            </Paper>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};
