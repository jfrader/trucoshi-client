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
  ListItemAvatar,
  ButtonProps,
} from "@mui/material";
import { useState, createRef, useLayoutEffect, FC, PropsWithChildren } from "react";
import { useChat } from "../../trucoshi/hooks/useChat";
import SendIcon from "@mui/icons-material/Send";
import {
  CARDS_HUMAN_READABLE,
  ECommand,
  ICard,
  IChatMessage,
  IPublicMatch,
  IPublicPlayer,
} from "trucoshi";
import { getTeamColor, getTeamName } from "../../utils/team";
import { bounce } from "../../assets/animations/bounce";
import { useSound } from "../../sound/hooks/useSound";
import { COMMANDS_HUMAN_READABLE } from "../../trucoshi/constants";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { UserAvatar } from "../../shared/UserAvatar";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

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

export const FixedChatContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: 0,
  top: "48px",
  height: "15rem",
  width: "17rem",
  [theme.breakpoints.up("lg")]: {
    height: "calc(100vh - 48px)",
    width: "20rem",
  },
  transition: theme.transitions.create(["height"], {
    duration: theme.transitions.duration.standard,
  }),
  "& .MuiBox-root": {
    height: "100%",
  },
}));

export const ChatRoom = ({
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
    <form
      style={{ height: "100%", flexGrow: 1, display: "flex" }}
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
          width="100%"
          flexGrow={1}
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
    <Typography color={color} display="inline" variant="inherit">
      {message.command ? getTeamName(Number(message.user.key)) + " " : message.user.name + ": "}
    </Typography>
  );
};

export const getAvatar = (message: IChatMessage, players: IPublicPlayer[]) => {
  if (message.command) {
    return null;
  }

  const player = players.find((p) => p.key === message.user.key);

  if (player) {
    return (
      <ListItemAvatar sx={{ minWidth: "auto", pr: 1 }}>
        <UserAvatar size="tiny" account={player} bgcolor={getTeamColor(player.teamIdx) + ".main"} />
      </ListItemAvatar>
    );
  }

  return null;
};

export const ChatMessage = ({
  message,
  children,
  players = [],
  animate = false,
  hideAuthor = false,
  Component = Slide,
  ...props
}: PropsWithChildren<
  {
    message: IChatMessage;
    players?: Array<IPublicPlayer>;
    animate?: boolean;
    hideAuthor?: boolean;
    Component?: FC<SlideProps | FadeProps>;
  } & Partial<SlideProps | FadeProps>
>) => {
  return (
    <Component in={true} direction="right" mountOnEnter unmountOnExit {...props}>
      <ListItem
        sx={{
          textAlign: "inherit",
          animation: animate ? `0.6s ${bounce} ${message.command ? 4 : 1}` : "",
          py: "0.05em",
        }}
      >
        {getAvatar(message, players)}
        <ListItemText sx={{ textAlign: "inherit" }}>
          {hideAuthor || message.system ? null : (
            <MessageAuthor message={message} players={players} />
          )}
          <Typography
            color={messageColor(message, players)}
            display="inline"
            variant="inherit"
            sx={{ wordWrap: "break-word" }}
          >
            {children ? children : <MessageContent>{message}</MessageContent>}
          </Typography>
        </ListItemText>
      </ListItem>
    </Component>
  );
};

export const getMessageContent = (message: IChatMessage) => {
  if (message.command) {
    const humanCommand = COMMANDS_HUMAN_READABLE[message.content as ECommand];

    return humanCommand ? humanCommand.toUpperCase() : message.content;
  }

  if (message.card) {
    return CARDS_HUMAN_READABLE[message.content as ICard] || message.content;
  }

  return message.content;
};

export const ChatButton = ({
  message,
  children,
  ...props
}: ButtonProps & { message?: IChatMessage }) => {
  const [, { inspectCard }] = useTrucoshi();
  return (
    <Button
      onClick={message?.card ? () => inspectCard(message.content as ICard) : undefined}
      name={message?.content}
      disableElevation
      disableRipple={!message?.card}
      sx={(theme) => ({
        ml: 1,
        p: 0,
        px: 1,
        opacity: props.color ? 0.82 : undefined,
        minWidth: "auto",
        bgcolor: props.color ? undefined : theme.palette.action.disabledBackground,
        color: props.color ? undefined : theme.palette.action.active,
      })}
      {...props}
    >
      {children}
    </Button>
  );
};

export const MessageContent = ({ children }: { children: IChatMessage }) => {
  if (!children.card && !children.command) {
    return children.content;
  }
  return <ChatButton message={children}>{getMessageContent(children)}</ChatButton>;
};
