import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { MatchList } from "../components/game/MatchList";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { PageContainer } from "../shared/PageContainer";
import { ManageSearch } from "@mui/icons-material";
import { CreateMatchButton } from "../components/menu/CreateMatchButton";
import { EClientEvent, EServerEvent, IPublicMatchInfo } from "trucoshi";

export const Matches = () => {
  const [{ isConnected }, , socket] = useTrucoshi();

  const [publicMatches, setPublicMatches] = useState<IPublicMatchInfo[]>([]);

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

  return (
    <PageContainer title="Buscar Partida" icon={<ManageSearch fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack gap={4}>
            {isConnected ? (
              <MatchList
                matches={publicMatches}
                NoMatches={<Typography pl={1}>No se encontraron partidas</Typography>}
                title={"Partidas Online"}
                onRefresh={() => {
                  socket.emit(EClientEvent.LEAVE_ROOM, "searching");
                  setTimeout(() => {
                    socket.emit(EClientEvent.JOIN_ROOM, "searching");
                  }, 500);
                }}
              />
            ) : null}
            <CreateMatchButton />
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
