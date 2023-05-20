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
  styled,
  SlideProps,
  FadeProps,
} from "@mui/material";
import { useState, createRef, useLayoutEffect, FC } from "react";
import { useChat } from "../trucoshi/hooks/useChat";
import SendIcon from "@mui/icons-material/Send";
import {
  CARDS_HUMAN_READABLE,
  ECommand,
  ICard,
  IChatMessage,
  IPublicMatch,
  IPublicPlayer,
} from "trucoshi";
import { getTeamColor, getTeamName } from "../utils/team";
import { bounce } from "../assets/animations/bounce";
import { useSound } from "../sound/hooks/useSound";
import { COMMANDS_HUMAN_READABLE } from "../trucoshi/constants";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const ChatBox = styled(Box)<{ active: number }>(({ active }) => [
  {
    opacity: active ? 0.9 : 0.3,
  },
]);

type Props = BoxProps & {
  alwaysVisible?: boolean;
} & ReturnType<typeof useChatRoom>;

export const useChatRoom = (match?: IPublicMatch | null) => {
  const [active, setActive] = useState<boolean>(false);
  const [latestMessage, setLatestMessage] = useState<IChatMessage | null>(null);

  const { queue } = useSound();

  return {
    useChatState: useChat(match?.matchSessionId, (incomingMessage) => {
      if (incomingMessage) {
        setLatestMessage(incomingMessage);
        setActive(true);
        if (incomingMessage.card) {
          const rndSound = Math.round(Math.random() * 2);
          queue("play" + rndSound);
        }

        setTimeout(() => {
          setLatestMessage(null);
        }, 2500);
      }
    }),
    matchId: match?.matchSessionId,
    players: match?.players,
    active,
    setActive,
    latestMessage,
  };
};

const ChatContainer = styled(Box)(({ theme }) => ({
  height: "15rem",
  width: "17rem",
  [theme.breakpoints.up("lg")]: {
    height: "calc(100vh - 48px)",
    width: "16rem",
  },
  transition: theme.transitions.create(["height"], {
    duration: theme.transitions.duration.standard,
  }),
}));

export const ChatRoom = ({
  matchId,
  players,
  useChatState,
  active,
  setActive,
  latestMessage,
  alwaysVisible,
  ...boxProps
}: Props) => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [message, setMessage] = useState<string>("");

  const [room, chat, isLoading] = useChatState;

  const listRef = createRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
    }
  }, [listRef, room]);

  const onActivate = (e: any) => {
    e.stopPropagation();
    setActive(true);
  };

  return (
    <ChatContainer>
      <form
        style={{ height: "100%" }}
        onSubmit={(e) => {
          e.preventDefault();
          chat(message);
          setMessage("");
        }}
      >
        <ClickAwayListener onClickAway={active ? () => setActive(false) : () => {}}>
          <ChatBox
            active={Number(alwaysVisible || active)}
            onClick={onActivate}
            position="absolute"
            left="0"
            top="0"
            height="100%"
            width="100%"
            display="flex"
            textAlign="left"
            flexDirection="column"
            sx={{ zIndex: (theme) => theme.zIndex.drawer }}
            {...boxProps}
          >
            <List
              component={Paper}
              ref={listRef}
              sx={(theme) => ({
                justifyContent: "flex-end",
                m: 0,
                background: theme.palette.background.paper,
                overflowY: "scroll",
                flexGrow: 1,
                height: "15rem",
              })}
            >
              {room?.messages.map((message) => {
                return (
                  <ChatMessage
                    animate={message.id === latestMessage?.id}
                    key={message.id}
                    message={message}
                    players={players}
                  />
                );
              })}
            </List>
            <Slide in={isLg || alwaysVisible || active} direction="right">
              <ButtonGroup
                size="small"
                fullWidth
                component={Paper}
                sx={(theme) => ({
                  background: theme.palette.background.paper,
                })}
              >
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  color="warning"
                  size="small"
                  aria-autocomplete="none"
                  autoComplete="off"
                />
                <Button
                  sx={(theme) => ({ width: theme.spacing(4) })}
                  disabled={isLoading || !message}
                  color="warning"
                  variant="text"
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
    </ChatContainer>
  );
};

export const messageColor = (message: IChatMessage, players: IPublicPlayer[]) => {
  if (message.card) {
    return players.reduce((prev, player) => {
      return player.key === message.user.key ? getTeamColor(player.teamIdx) : prev;
    }, "text.primary" as string);
  }
  if (message.command) {
    return getTeamColor(Number(message.user.key));
  }
  return "text.primary";
};

export const authorColor = (message: IChatMessage, players: IPublicPlayer[]) => {
  if (message.command) {
    return getTeamColor(Number(message.user.key));
  }
  return players.reduce((prev, player) => {
    return player.key === message.user.key ? getTeamColor(player.teamIdx) : prev;
  }, "text.secondary" as string);
};

export const MessageAuthor = ({
  message,
  players = [],
}: {
  message: IChatMessage;
  players?: Array<IPublicPlayer>;
}) => {
  const color = authorColor(message, players);

  return (
    <Typography color={color} display="inline">
      {message.command ? getTeamName(Number(message.user.key)) + " " : message.user.id + ": "}
    </Typography>
  );
};

export const ChatMessage = ({
  message,
  players = [],
  animate = false,
  hideAuthor = false,
  Component = Slide,
  ...props
}: {
  message: IChatMessage;
  players?: Array<IPublicPlayer>;
  animate?: boolean;
  hideAuthor?: boolean;
  Component?: FC<SlideProps | FadeProps>;
} & Partial<SlideProps | FadeProps>) => {
  return (
    <Component in={true} direction="right" mountOnEnter unmountOnExit {...props}>
      <ListItem
        sx={{
          textAlign: "inherit",
          animation: animate ? `0.6s ${bounce} ${message.command ? 4 : 1}` : "",
          py: "0.05em",
        }}
      >
        <ListItemText sx={{ textAlign: "inherit" }}>
          {hideAuthor || message.system ? null : (
            <MessageAuthor message={message} players={players} />
          )}
          <Typography
            color={messageColor(message, players)}
            display="inline"
            sx={{ wordWrap: "break-word" }}
          >
            <MessageContent>{message}</MessageContent>
          </Typography>
        </ListItemText>
      </ListItem>
    </Component>
  );
};

const getMessageContent = (message: IChatMessage) => {
  if (message.command) {
    const humanCommand = COMMANDS_HUMAN_READABLE[message.content as ECommand];
    if (humanCommand) {
      return humanCommand.toUpperCase();
    }
    return message.content;
  }

  if (message.card) {
    return CARDS_HUMAN_READABLE[message.content as ICard] || message.content;
  }

  return message.content;
};

export const MessageContent = ({ children }: { children: IChatMessage }) => {
  return <span>{getMessageContent(children)}</span>;
};
