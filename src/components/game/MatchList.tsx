import {
  Badge,
  BadgeProps,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPublicMatchInfo, EMatchState } from "trucoshi";

const MATCH_STATE_MAP: { [key in EMatchState]: [string, BadgeProps["color"]] } = {
  [EMatchState.FINISHED]: ["Terminada", "error"],
  [EMatchState.STARTED]: ["Jugando", "warning"],
  [EMatchState.UNREADY]: ["En lobby", "success"],
  [EMatchState.READY]: ["En lobby", "success"],
};

export const MatchList = ({
  matches,
  title,
  dense,
  NoMatches = null,
  onRefresh,
}: {
  title: string;
  dense?: boolean;
  matches: Array<IPublicMatchInfo>;
  NoMatches?: ReactElement | null;
  onRefresh?(): void;
}) => {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
  }, [matches]);

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <Typography
        width="100%"
        textAlign="left"
        color="text.disabled"
        textTransform="uppercase"
        variant="subtitle1"
      >
        {title}
        {onRefresh ? (
          <IconButton
            size="large"
            color="success"
            onClick={() => {
              onRefresh();
              setLoading(true);
            }}
          >
            <Box maxHeight="1em">
              {isLoading ? <CircularProgress color="success" size="0.8em" /> : <RefreshIcon />}
            </Box>
          </IconButton>
        ) : null}
      </Typography>
      {matches.length ? (
        <Box>
          <List dense={dense}>
            <ListItem divider>
              <ListItemAvatar>Host</ListItemAvatar>
              <ListItemSecondaryAction>Jugadores</ListItemSecondaryAction>
            </ListItem>
            {matches.map((info) => {
              const [state, color] = MATCH_STATE_MAP[info.state];
              return (
                <Tooltip
                  key={info.matchSessionId}
                  placement="right"
                  title={<Typography color={color}>{state}</Typography>}
                >
                  <ListItemButton onClick={() => navigate(`/lobby/${info.matchSessionId}`)}>
                    <ListItemText>
                      <p>{info.ownerId}</p>
                    </ListItemText>
                    <ListItemAvatar>
                      <Typography variant="subtitle1">
                        {info.players} / {info.options.maxPlayers}
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
        <Box textAlign="left" width="100%">
          {NoMatches}
        </Box>
      )}
    </Box>
  );
};
