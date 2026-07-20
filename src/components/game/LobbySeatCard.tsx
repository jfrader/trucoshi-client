import { Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ILobbyOptions, IPublicPlayer } from "trucoshi";
import { getTeamColor, getTeamDisplayName } from "../../utils/team";
import { UserAvatar } from "../../shared/UserAvatar";
import { Sats } from "../../shared/Sats";
import { Link } from "../../shared/Link";
import { AnimatedButton } from "../../shared/AnimatedButton";
import { GameCard } from "../card/GameCard";
import { BURNT_CARD } from "trucoshi";
import { useBoardLayout } from "../../board";
import { TrucoBoardSlot } from "./TrucoBoardLayout";
import { memo } from "react";
import { useLobbyGameplay } from "./LobbyGameplayContext";
import { SeatAvatarBadges } from "./SeatAvatarBadges";
import { SeatChatBubble } from "./SeatChatBubble";

type LobbySeatCardProps = {
  slot: TrucoBoardSlot<IPublicPlayer>;
};

const getTeamCount = (players: IPublicPlayer[], teamIdx: 0 | 1) =>
  players.filter((player) => player.teamIdx === teamIdx).length;

const canJoinTeam = ({
  players,
  options,
  teamIdx,
}: {
  players: IPublicPlayer[];
  options: ILobbyOptions;
  teamIdx: 0 | 1;
}) => {
  const teamCount = getTeamCount(players, teamIdx);
  const teamCap = options.maxPlayers / 2;

  return players.length < options.maxPlayers && teamCount < teamCap;
};

const _LobbySeatCard = ({ slot }: LobbySeatCardProps) => {
  const {
    state: { match, account, isReadyLoading, isAdmissionDraining, chatProps },
    actions: { onJoinMatch, onAddBot, onSetReady, onSetUnReady, kickPlayer },
  } = useLobbyGameplay();
  const layout = useBoardLayout();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const seatCard = layout.lobby?.seatCard;

  if (!seatCard) {
    return null;
  }

  const teamLabel = (
    <Typography color={`${getTeamColor(slot.teamIdx)}.light`} fontSize="1rem">
      {getTeamDisplayName(match, slot.teamIdx)}
    </Typography>
  );

  if (!slot.player) {
    const canJoin = canJoinTeam({
      players: match.players,
      options: match.options,
      teamIdx: slot.teamIdx,
    });

    const canJoinBet =
      !match.options.satsPerPlayer ||
      (account?.wallet?.balanceInSats || 0) >= match.options.satsPerPlayer;

    return (
      <Paper
        sx={(theme) => ({
          ...theme.trucoshiUi.lobby.seatCard,
          p: seatCard.padding,
          minWidth: seatCard.minWidth,
          borderRadius: seatCard.borderRadius,
        })}
      >
        <Box
          sx={{
            minHeight: seatCard.headerHeight,
            display: "flex",
            alignItems: "center",
            pl: 1,
          }}
        >
          {teamLabel}
        </Box>

        <Box
          sx={{
            mt: 0.6,
            minHeight: seatCard.cardsHeight,
            height: seatCard.cardsHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        <Stack
          mt={0.7}
          spacing={0.5}
          sx={{
            minHeight: seatCard.actionsHeight,
            height: seatCard.actionsHeight,
            justifyContent: "flex-end",
          }}
        >
          {canJoin && canJoinBet ? (
            <>
              {slot.teamIdx !== match.me?.teamIdx ? (
                <Button
                  variant="contained"
                  disabled={isReadyLoading || isAdmissionDraining}
                  color={getTeamColor(slot.teamIdx)}
                  size="small"
                  onClick={() => onJoinMatch(slot.teamIdx)}
                >
                  Unirse
                </Button>
              ) : (
                <Typography color="text.disabled" fontSize="0.74rem">
                  Espacio libre
                </Typography>
              )}

              {match.me?.isOwner && match.options.satsPerPlayer <= 0 ? (
                <Button
                  variant="outlined"
                  disabled={isReadyLoading || isAdmissionDraining}
                  color="warning"
                  size="small"
                  onClick={() => onAddBot(slot.teamIdx)}
                >
                  Agregar Bot
                </Button>
              ) : (
                <Box sx={{ height: "2rem", visibility: "hidden" }} />
              )}
            </>
          ) : canJoin && !canJoinBet ? (
            <>
              {account?.wallet ? (
                <Typography color={`${getTeamColor(slot.teamIdx)}.light`} fontSize="0.75rem">
                  Necesitas depositar sats
                </Typography>
              ) : (
                <Button
                  color={getTeamColor(slot.teamIdx)}
                  component={Link}
                  to="/login"
                  size="small"
                >
                  Inicia sesion
                </Button>
              )}
              <Box sx={{ height: "2rem", visibility: "hidden" }} />
            </>
          ) : (
            <>
              <Typography color="text.disabled" fontSize="0.75rem">
                Completo
              </Typography>
              <Box sx={{ height: "2rem", visibility: "hidden" }} />
            </>
          )}
        </Stack>
      </Paper>
    );
  }

  const player = slot.player;
  const hiddenCardsCount = Math.min(player.hand.length || 3, 3);
  const say = chatProps.useChatState?.[3] || null;
  const chatRoom = chatProps.useChatState?.[0] || null;
  const avatarSizePx = isDesktop ? 36 : 24;

  return (
    <Paper
      sx={(theme) => ({
        ...theme.trucoshiUi.lobby.seatCard,
        p: 1,
        minWidth: seatCard.minWidth,
        borderRadius: seatCard.borderRadius,
      })}
    >
      <Box
        sx={{
          minHeight: seatCard.headerHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack direction="row" alignItems="start" spacing={0.8}>
          <Box
            position="absolute"
            left={-6}
            top={-5}
            sx={{
              width: avatarSizePx,
              height: avatarSizePx,
            }}
          >
            <UserAvatar
              account={player}
              size={isDesktop ? "medium" : "small"}
              bgcolor={`${getTeamColor(player.teamIdx)}.main`}
            />
            <SeatAvatarBadges player={player} say={say} showHost={player.isOwner} />
            <SeatChatBubble player={player} room={chatRoom} compact />
          </Box>
          <Box minWidth={0}>
            <Typography
              color="common.white"
              fontWeight={700}
              fontSize="0.98rem"
              noWrap
              title={player.name}
            >
              {player.name}
            </Typography>
            <Typography fontSize="0.92rem" color="grey.300">
              {player.ready ? "Listo" : "Esperando"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          minHeight: seatCard.cardsHeight,
          height: seatCard.cardsHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack direction="row" pt={4} justifyContent="center">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Box
              key={`${player.key}-${idx}`}
              ml={idx ? seatCard.hiddenCardOverlap : 0}
              sx={{ visibility: idx < hiddenCardsCount ? "visible" : "hidden" }}
            >
              <GameCard disableButton card={BURNT_CARD} width={seatCard.hiddenCardWidth} shadow />
            </Box>
          ))}
        </Stack>
      </Box>

      <Stack
        spacing={0.5}
        sx={{
          mt: 1.4,
          minHeight: seatCard.actionsHeight,
          height: seatCard.actionsHeight,
          justifyContent: "flex-end",
        }}
      >
        {player.isMe ? (
          <>
            {player.ready ? (
              <Button
                title="Click para dejar de estar listo"
                disabled={isReadyLoading}
                size="small"
                color="success"
                variant="contained"
                onClick={onSetUnReady}
                endIcon={
                  player.ready && match.options.satsPerPlayer > 0 && account ? (
                    <Sats variant="body2">{match.options.satsPerPlayer}</Sats>
                  ) : undefined
                }
              >
                Listo
              </Button>
            ) : (
              <AnimatedButton
                title="Pone listo para empezar"
                variant="contained"
                disabled={isReadyLoading}
                size="small"
                color="warning"
                onClick={onSetReady}
              >
                Estoy Listo
              </AnimatedButton>
            )}

            {!match.me?.isOwner ? (
              <Button
                color="error"
                size="small"
                onClick={() => match.me && kickPlayer(match.me.key)}
              >
                Salir
              </Button>
            ) : null}
          </>
        ) : (
          <Stack spacing={0.5}>
            {teamLabel}
            {match.me?.isOwner ? (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => kickPlayer(player.key)}
              >
                Quitar
              </Button>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export const LobbySeatCard = memo(_LobbySeatCard);
