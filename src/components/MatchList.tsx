import {
  Badge,
  BadgeProps,
  Box,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ReactElement } from "react";
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
  const navigate = useNavigate();

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" justifyContent="center">
      <Typography color="warning" textTransform="uppercase" variant="h6">
        {title}
        {onRefresh ? (
          <IconButton size="large" color="success" onClick={() => onRefresh()}>
            <RefreshIcon />
          </IconButton>
        ) : null}
      </Typography>
      {matches.length ? (
        <Box>
          <List component="nav">
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
                        {info.players} / {info.maxPlayers}
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
        NoMatches
      )}
    </Box>
  );
};
