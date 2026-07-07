import { Box, Button, Stack, Typography, styled } from "@mui/material";
import { Backdrop } from "../../shared/Backdrop";
import { useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";
import { GameOptionsList } from "../game/GameOptionsList";
import { UserAvatar } from "../../shared/UserAvatar";

const QueueMatchContent = styled(Stack)(({ theme }) => theme.trucoshiUi.queue.matchFoundContent);

const QueueParticipantList = styled(Stack)(({ theme }) => theme.trucoshiUi.queue.participantList);

const QueueParticipantChip = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "ready",
})<{ ready: boolean }>(({ ready, theme }) => ({
  ...theme.trucoshiUi.queue.participantChip,
  ...(ready
    ? theme.trucoshiUi.queue.participantReadyChip
    : theme.trucoshiUi.queue.participantPendingChip),
}));

const QueueParticipantStatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "ready",
})<{ ready: boolean }>(({ ready, theme }) => ({
  ...theme.trucoshiUi.queue.participantStatusDot,
  backgroundColor: ready ? theme.palette.success.main : theme.palette.error.main,
  ...(ready
    ? theme.trucoshiUi.queue.participantReadyStatusDot
    : theme.trucoshiUi.queue.participantPendingStatusDot),
}));

export const QueueMatchOverlay = () => {
  const matchQueue = useMatchQueue({ listen: true });
  const queueParticipants = matchQueue.queueProposal?.participants ?? [];

  return (
    <Backdrop
      hideLogo
      message={matchQueue.isQueueStarting ? "¡Partida lista!" : "Partida encontrada"}
      opacity={0.85}
      open={matchQueue.matchFound}
    >
      <Stack gap={4}>
        <QueueMatchContent width="100%">
          {matchQueue.isQueueStarting ? (
            <Stack gap={1} alignItems="center">
              <Typography variant="h5">El juego inicia en...</Typography>
              <Typography variant="h2" fontWeight="bold" color="success.main" lineHeight={1}>
                {matchQueue.waitSeconds}
              </Typography>
            </Stack>
          ) : (
            <>
              <QueueParticipantList px={4} direction="row" flexWrap="wrap">
                {queueParticipants.map((participant) => (
                  <QueueParticipantChip
                    key={`${participant.session}-${participant.name}`}
                    ready={participant.ready}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <UserAvatar account={participant} size="tiny" />
                    <Typography variant="body2" fontWeight={800} noWrap title={participant.name}>
                      {participant.name}
                    </Typography>
                    <QueueParticipantStatusDot justifySelf="end" ready={participant.ready} />
                  </QueueParticipantChip>
                ))}
              </QueueParticipantList>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Confirmá antes de {matchQueue.waitSeconds}s para empezar.
              </Typography>

              <Stack direction="row" gap={1} justifyContent="center" flexWrap="wrap">
                <Button
                  color="success"
                  disabled={matchQueue.isQueueReadyConfirmed}
                  onClick={matchQueue.confirmQueueMatch}
                  size="large"
                  variant="contained"
                >
                  {matchQueue.isQueueReadyConfirmed ? "Listo" : "Aceptar"}
                </Button>
                <Button
                  color="error"
                  onClick={matchQueue.declineQueueMatch}
                  size="large"
                  variant="contained"
                >
                  Cancelar
                </Button>
              </Stack>
            </>
          )}
        </QueueMatchContent>
        <QueueMatchContent>
          {matchQueue.queueProposal ? (
            <GameOptionsList
              sx={{ width: "100%", px: 4 }}
              keys={["matchPoint", "faltaEnvido", "flor", "turnTime"]}
              options={matchQueue.queueProposal.lobbyOptions}
            />
          ) : null}
        </QueueMatchContent>
      </Stack>
    </Backdrop>
  );
};
