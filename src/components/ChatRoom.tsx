import {
  Box,
  BoxProps,
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
import { IChatMessage, IPublicPlayer } from "trucoshi";
import { getTeamColor, getTeamName } from "../utils/team";
import { bounce } from "../animations/bounce";

const ChatBox = styled(Box)<{ active: number }>(({ active }) => [
  {
    opacity: active ? "0.95" : "0.4",
  },
]);

export const ChatRoom = ({
  matchId,
  players,
  ...props
}: BoxProps & {
  matchId?: string;
  players?: Array<IPublicPlayer>;
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const theme = useTheme();
  const listRef = createRef<HTMLDivElement>();
  const formRef = createRef<HTMLFormElement>();

  const [room, chat, isLoading] = useChat(matchId, () => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
      setActive(true);
    }
  });

  const onActivate = (e: any) => {
    e.stopPropagation();
    setActive(true);
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        chat(message);
        setMessage("");
      }}
    >
      <ClickAwayListener onClickAway={() => setActive(false)}>
        <ChatBox
          active={Number(active)}
          onClick={onActivate}
          position="absolute"
          left="0"
          top="0"
          height="15rem"
          zIndex={theme.zIndex.modal}
          width="15rem"
          display="flex"
          flexDirection="column"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
          {...props}
        >
          <List
            component={Paper}
            ref={listRef}
            sx={{
              justifyContent: "flex-end",
              m: 0,
              overflowY: "scroll",
              flexGrow: 1,
              height: "15rem",
            }}
          >
            {room?.messages.map((message) => {
              return <Message key={message.date} message={message} players={players} />;
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
      </ClickAwayListener>
    </form>
  );
};

const MessageAuthor = ({
  message,
  players,
}: {
  message: IChatMessage;
  players?: Array<IPublicPlayer>;
}) => {
  const color = message.command
    ? getTeamColor(Number(message.user.key))
    : players?.reduce((prev, player) => {
        return player.key === message.user.key ? getTeamColor(player.teamIdx) : prev;
      }, "text.primary" as string);

  return (
    <Typography color={color} display="inline">
      {message.command ? getTeamName(Number(message.user.key)) + " " : message.user.id + ": "}
    </Typography>
  );
};

const Message = ({
  message,
  players,
}: {
  message: IChatMessage;
  players?: Array<IPublicPlayer>;
}) => {
  return (
    <Slide in={true} direction="right">
      <ListItem
        sx={{
          animation: `0.6s ${bounce} ${message.command ? 6 : 1}`,
          py: "0.05em",
        }}
      >
        <ListItemText>
          {message.system ? null : <MessageAuthor message={message} players={players} />}
          <Typography
            color={message.command ? getTeamColor(Number(message.user.key)) : "text.secondary"}
            display="inline"
            sx={{ wordWrap: "break-word" }}
          >
            {message.content}
          </Typography>
        </ListItemText>
      </ListItem>
    </Slide>
  );
};
