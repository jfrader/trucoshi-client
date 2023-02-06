import {
  Badge,
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
    <Box display="flex" flexGrow={1} flexDirection="column">
      <Typography color="warning" variant="h5">
        {title}
        {onRefresh ? (
          <IconButton onClick={() => onRefresh()}>
            <RefreshIcon />
          </IconButton>
        ) : null}
      </Typography>
      {matches.length ? (
        <Box>
          <List component="nav">
            {matches.map((info) => (
              <Tooltip
                key={info.matchSessionId}
                placement="right"
                title={
                  <Typography color="success">
                    {info.state === EMatchTableState.STARTED ? "En progreso" : "En lobby"}
                  </Typography>
                }
              >
                <ListItemButton onClick={() => navigate(`/lobby/${info.matchSessionId}`)}>
                  <ListItemText>
                    <p>{info.matchSessionId}</p>
                  </ListItemText>
                  <ListItemAvatar>
                    <Typography variant="subtitle1">
                      {info.players} / {info.maxPlayers}
                    </Typography>
                  </ListItemAvatar>
                  <Badge
                    variant="dot"
                    color={info.state === EMatchTableState.STARTED ? "warning" : "success"}
                  />
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Box>
      ) : (
        NoMatches
      )}
    </Box>
  );
};
