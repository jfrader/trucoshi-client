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
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EMatchTableState, IPublicMatchInfo } from "trucoshi";

const MATCH_STATE_MAP: { [key in EMatchTableState]: [string, BadgeProps["color"]] } = {
  [EMatchTableState.FINISHED]: ["Terminada", "error"],
  [EMatchTableState.STARTED]: ["Jugando", "warning"],
  [EMatchTableState.UNREADY]: ["En lobby", "success"],
  [EMatchTableState.READY]: ["En lobby", "success"],
};

export const MatchList = ({
  matches,
  title,
  NoMatches = null,
  onRefresh,
}: {
  title: string;
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
    <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center">
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
          <List>
            <ListItem>
              <ListItemText>Host</ListItemText>
              <ListItemAvatar>Jugadores</ListItemAvatar>
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
