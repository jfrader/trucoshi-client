import {
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slide,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState, createRef } from "react";
import { useChat } from "../trucoshi/hooks/useChat";
import SendIcon from "@mui/icons-material/Send";
import { IPublicPlayer } from "trucoshi";
import { getTeamColor } from "../utils/team";

export const ChatRoom = ({
  matchId,
  players,
}: {
  matchId?: string;
  players?: Array<IPublicPlayer>;
}) => {
  const [message, setMessage] = useState<string>("");
  const theme = useTheme();
  const listRef = createRef<HTMLDivElement>();

  const [room, chat, isLoading] = useChat(matchId, () => {
    listRef.current?.scrollTo({
      top: listRef.current?.scrollHeight,
    });
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        chat(message);
        setMessage("");
      }}
    >
      <Box
        sx={{
          height: theme.spacing(32),
          width: theme.spacing(32),
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <List
          component={Paper}
          ref={listRef}
          sx={{
            justifyContent: "flex-end",
            display: "flex",
            flexDirection: "column",
            m: 0,
            overflowY: "scroll",
            flexGrow: 1,
            maxHeight: "100%",
          }}
        >
          {room?.messages.map((message) => {
            return (
              <Slide in={true} direction="right" key={message.date}>
                <ListItem
                  sx={{
                    py: "0.05em",
                  }}
                >
                  <ListItemText>
                    {message.system ? null : (
                      <Typography
                        color={players?.reduce((prev, player) => {
                          return player.key === message.user.key
                            ? getTeamColor(player.teamIdx)
                            : prev;
                        }, "text.primary" as string)}
                        display="inline"
                      >
                        {message.user.id}:{" "}
                      </Typography>
                    )}
                    <Typography
                      color="text.secondary"
                      display="inline"
                      sx={{ wordWrap: "break-word" }}
                    >
                      {message.content}
                    </Typography>
                  </ListItemText>
                </ListItem>
              </Slide>
            );
          })}
        </List>
        <ButtonGroup size="small" fullWidth component={Paper}>
          <TextField
            color="warning"
            size="small"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            disabled={isLoading}
            color="warning"
            variant="outlined"
            sx={{ width: theme.spacing(6) }}
            size="small"
            type="submit"
          >
            <SendIcon />
          </Button>
        </ButtonGroup>
      </Box>
    </form>
  );
};
