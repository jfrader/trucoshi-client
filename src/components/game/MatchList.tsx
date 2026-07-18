import {
  Badge,
  BadgeProps,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { ReactElement, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { IPublicMatchInfo, EMatchState } from "trucoshi";

const MATCH_STATE_MAP: { [key in EMatchState]: [string, BadgeProps["color"]] } = {
  [EMatchState.FINISHED]: ["Terminada", "error"],
  [EMatchState.STARTED]: ["Jugando", "warning"],
  [EMatchState.UNREADY]: ["En lobby", "success"],
  [EMatchState.READY]: ["En lobby", "info"],
  [EMatchState.PAUSED]: ["En pausa", "warning"],
};

export const MatchList = ({
  action,
  matches,
  title,
  dense,
  NoMatches = null,
}: {
  title: string;
  dense?: boolean;
  matches: Array<IPublicMatchInfo>;
  NoMatches?: ReactElement | null;
  action?: ReactNode;
}) => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Typography
        width="100%"
        textAlign="left"
        color="text.disabled"
        textTransform="uppercase"
        variant="subtitle1"
        display="flex"
        gap={4}
      >
        <Box flexGrow={1}>{title}</Box>
        {action}
      </Typography>
      {matches.length ? (
        <Box pt={2}>
          <List dense={dense}>
            {matches.map((info) => {
              const [state, color] = MATCH_STATE_MAP[info.state];
              const isStarted =
                info.state === EMatchState.STARTED || info.state === EMatchState.FINISHED;
              return (
                <Tooltip
                  key={info.matchSessionId}
                  placement="right"
                  title={<Typography color={color}>{state}</Typography>}
                >
                  <ListItemButton
                    onClick={() =>
                      navigate(
                        isStarted
                          ? `/match/${info.matchSessionId}`
                          : `/lobby/${info.matchSessionId}`,
                      )
                    }
                  >
                    <ListItemText>
                      <b>{info.matchSessionId}</b>
                      <div>{info.ownerId}</div>
                    </ListItemText>
                    <ListItemAvatar>
                      <Typography variant="subtitle1">
                        {info.players} / {isStarted ? info.players : info.options.maxPlayers}
                      </Typography>
                    </ListItemAvatar>
                    <Badge variant="dot" color={color} />
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>
      ) : (
        <Box pt={2} textAlign="left" width="100%">
          {NoMatches}
        </Box>
      )}
    </Box>
  );
};
