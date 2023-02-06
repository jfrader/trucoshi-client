import {
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slide,
  ClickAwayListener,
  TextField,
  Typography,
  useTheme,
  styled,
} from "@mui/material";
import { useState, createRef } from "react";
import { useChat } from "../trucoshi/hooks/useChat";
import SendIcon from "@mui/icons-material/Send";
import { IPublicPlayer } from "trucoshi";
import { getTeamColor } from "../utils/team";
import { bounce } from "../animations/bounce";

const ChatBox = styled(Box)<{ active: boolean }>(({ theme, active }) => [
  {
    opacity: active ? "0.95" : "0.4",
  },
]);

export const ChatRoom = ({
  matchId,
  players,
}: {
  matchId?: string;
  players?: Array<IPublicPlayer>;
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const theme = useTheme();
  const listRef = createRef<HTMLDivElement>();
  const formRef = createRef<HTMLFormElement>();

  const [room, chat, isLoading] = useChat(matchId, () => {
    listRef.current?.scrollTo({
      top: listRef.current?.scrollHeight,
    });
    setActive(true);
  });

  const onActivate = (e: any) => {
    e.stopPropagation();
    setActive(true);
  };

  return (
    <ClickAwayListener onClickAway={() => setActive(false)}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          chat(message);
          setMessage("");
        }}
      >
        <ChatBox
          onClick={onActivate}
          position="absolute"
          left="2rem"
          top="2rem"
          height="15rem"
          zIndex={theme.zIndex.modal}
          width="15rem"
          display="flex"
          flexDirection="column"
          active={active}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
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
                      animation: `0.6s ${bounce} 1`,
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
          <Slide in={active} direction="right">
            <ButtonGroup size="small" fullWidth component={Paper}>
              <TextField
                color="warning"
                size="small"
                aria-autocomplete="none"
                autoComplete="off"
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
          </Slide>
        </ChatBox>
      </form>
    </ClickAwayListener>
  );
};
