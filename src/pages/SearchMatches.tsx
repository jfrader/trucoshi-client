import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MatchList } from "../components/game/MatchList";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { PageContainer } from "../shared/PageContainer";
import { ManageSearch } from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CreateMatchButton } from "../components/menu/CreateMatchButton";
import { EClientEvent, EServerEvent, IPublicMatchInfo } from "trucoshi";
import { OnlinePlayers } from "../components/menu/PlayMenu";

export const SearchMatches = () => {
  const [{ isConnected, stats }, , socket] = useTrucoshi();

  const [publicMatches, setPublicMatches] = useState<IPublicMatchInfo[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    socket.emit(EClientEvent.JOIN_ROOM, "searching");

    socket.on(EServerEvent.UPDATE_PUBLIC_MATCHES, (matches) => {
      setPublicMatches(matches);
    });

    return () => {
      socket.emit(EClientEvent.LEAVE_ROOM, "searching");
      socket.off(EServerEvent.UPDATE_PUBLIC_MATCHES);
    };
  }, [socket]);

  useEffect(() => {
    setLoading(false);
  }, [publicMatches]);

  const onRefresh = () => {
    socket.emit(EClientEvent.LEAVE_ROOM, "searching");
    setTimeout(() => {
      socket.emit(EClientEvent.JOIN_ROOM, "searching");
    }, 500);
  };

  return (
    <PageContainer
      title="Buscar Partida"
      icon={<ManageSearch fontSize="large" />}
      action={
        <IconButton
          size="large"
          sx={{ padding: 0 }}
          color="success"
          onClick={() => {
            onRefresh();
            setLoading(true);
          }}
        >
          <Box maxHeight="1em">
            {isLoading ? (
              <CircularProgress color="success" size="0.9em" />
            ) : (
              <RefreshIcon fontSize="large" />
            )}
          </Box>
        </IconButton>
      }
    >
      <Card>
        <CardContent>
          <Stack gap={4}>
            {isConnected ? (
              <MatchList
                matches={publicMatches}
                NoMatches={<Typography pl={1}>No se encontraron partidas</Typography>}
                title={"Partidas Online"}
                action={<OnlinePlayers label="Jugadores" stats={stats} />}
              />
            ) : null}
            <CreateMatchButton />
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
