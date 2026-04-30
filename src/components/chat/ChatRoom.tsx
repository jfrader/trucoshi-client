import {
  Box,
  BoxProps,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slide,
  ClickAwayListener,
  Typography,
  styled,
  SlideProps,
  FadeProps,
  ListItemAvatar,
  ButtonProps,
} from "@mui/material";
import {
  useState,
  useLayoutEffect,
  useEffect,
  FC,
  PropsWithChildren,
  useRef,
  lazy,
  Suspense,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useChat } from "../../trucoshi/hooks/useChat";
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
import { COMMANDS_HUMAN_READABLE } from "../../trucoshi/constants";
import { UserAvatar } from "../../shared/UserAvatar";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import EmojiConvertor from "emoji-js";
import ChatField from "./ChatField";

const ChatFieldWithEmojis = lazy(() => import("./ChatFieldWithEmojis"));

const ChatBox = styled(Box)<{ active: number }>(({ active }) => [
  {
    opacity: active ? 0.9 : 0.3,
  },
]);

type Props = BoxProps & {
  alwaysVisible?: boolean;
  messageFilter?: (message: IChatMessage) => boolean;
  hideInput?: boolean;
} & ReturnType<typeof useChatRoom>;

const MESSAGE_GROUPING_THRESHOLD = 1 * 60 * 1000;

const getPlayersSignature = (players: IPublicPlayer[] | undefined) =>
  (players || [])
    .map((player) => `${player.key}:${player.name}:${player.teamIdx}`)
    .join("|");

const useStableChatPlayers = (players: IPublicPlayer[] | undefined) => {
  const previousPlayersRef = useRef<IPublicPlayer[] | undefined>(players);
  const previousSignatureRef = useRef<string>(getPlayersSignature(players));
  const nextSignature = getPlayersSignature(players);

  if (previousSignatureRef.current !== nextSignature) {
    previousSignatureRef.current = nextSignature;
    previousPlayersRef.current = players;
  }

  return previousPlayersRef.current;
};

export const useChatRoom = (match?: IPublicMatch | null) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const latestAnimatedMessageIdRef = useRef<IChatMessage["id"] | null>(null);

  const [active, setActive] = useState<boolean>(false);
  const [latestMessage, setLatestMessage] = useState<IChatMessage | null>(null);
  const onIncomingMessage = useCallback((incomingMessage?: IChatMessage) => {
    if (!incomingMessage) {
      return;
    }

    if (incomingMessage.command) {
      if (latestAnimatedMessageIdRef.current === incomingMessage.id) {
        return;
      }
      latestAnimatedMessageIdRef.current = incomingMessage.id;
      setLatestMessage(incomingMessage);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setLatestMessage(null);
      }, 2500);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const useChatState = useChat(match?.matchSessionId, onIncomingMessage);

  return useMemo(
    () => ({
      useChatState,
      players: match?.players,
      active,
      setActive,
      latestMessage,
    }),
    [active, latestMessage, match?.players, useChatState]
  );
};

export const FixedChatContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: 0,
  top: "48px",
  height: "15rem",
  width: "17rem",
  zIndex: theme.zIndex.drawer,
  [theme.breakpoints.up("lg")]: {
    height: "calc(100vh - 48px)",
    width: "19.5rem",
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
  messageFilter,
  hideInput,
  ...boxProps
}: Props) => {
  const [room, chat, isLoading] = useChatState;
  const stablePlayers = useStableChatPlayers(players);

  const listRef = useRef<HTMLDivElement | null>(null);

  const filteredMessages = useMemo(() => {
    const allMessages = room?.messages || [];
    return messageFilter ? allMessages.filter(messageFilter) : allMessages;
  }, [messageFilter, room?.messages]);

  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
    }
  }, [filteredMessages.length]);

  const onActivate = (e: any) => {
    e.stopPropagation();
    setActive(true);
  };

  const messagesWithAuthorVisibility = useMemo(
    () =>
      filteredMessages.map((message, index) => {
        const prevMessage = index > 0 ? filteredMessages[index - 1] : null;
        const isConsecutive = Boolean(
          prevMessage &&
            prevMessage.user.key === message.user.key &&
            !message.system &&
            !message.card &&
            !message.command &&
            !prevMessage.card &&
            !prevMessage.command &&
            message.date * 1000 - prevMessage.date * 1000 <= MESSAGE_GROUPING_THRESHOLD
        );

        return { message, hideAuthor: isConsecutive };
      }),
    [filteredMessages]
  );

  return (
    <ClickAwayListener
      onClickAway={active && !alwaysVisible ? () => setActive(false) : () => {}}
    >
      <ChatBox
        active={Number(alwaysVisible || active)}
        onClick={onActivate}
        position="absolute"
        left="0"
        top="0"
        right="0"
        bottom="0"
        width="100%"
        height="100%"
        minHeight={0}
        display="flex"
        textAlign="left"
        flexDirection="column"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer,
          overflow: "hidden",
        }}
        {...boxProps}
      >
        <List
          component={Paper}
          ref={listRef}
          sx={(theme) => ({
            justifyContent: "flex-end",
            m: 0,
            background: theme.palette.background.paper,
            overflowY: "auto",
            width: "100%",
            flex: 1,
            minHeight: 0,
            borderRadius: 0,
          })}
        >
          {messagesWithAuthorVisibility?.map(({ message, hideAuthor }) => (
            <MemoizedChatMessage
              animate={message.id === latestMessage?.id}
              key={message.id}
              message={message}
              players={stablePlayers}
              hideAuthor={hideAuthor}
            />
          ))}
        </List>
        {hideInput ? null : (
          <Suspense
            fallback={
              <ChatField
                alwaysVisible={alwaysVisible}
                active={active}
                isLoading={isLoading}
                chat={chat}
                disableEmojis
              />
            }
          >
            <ChatFieldWithEmojis
              alwaysVisible={alwaysVisible}
              active={active}
              isLoading={isLoading}
              chat={chat}
            />
          </Suspense>
        )}
      </ChatBox>
    </ClickAwayListener>
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
      <ListItemAvatar sx={{ minWidth: "auto", pr: 1, alignSelf: "start", mt: 0.3 }}>
        <UserAvatar size="tiny" account={player} bgcolor={getTeamColor(player.teamIdx) + ".main"} />
      </ListItemAvatar>
    );
  }

  if (!message.system && !message.card && !message.command) {
    return (
      <ListItemAvatar sx={{ minWidth: "auto", pr: 1, alignSelf: "start", mt: 0.3 }}>
        <UserAvatar size="tiny" account={{ name: message.user.name }} bgcolor={"text.disabled"} />
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
    hideAuthor?: boolean | null;
    Component?: FC<SlideProps | FadeProps>;
  } & Partial<SlideProps | FadeProps>
>) => {
  return (
    <Component in={true} direction="right" mountOnEnter unmountOnExit {...props}>
      <ListItem
        sx={{
          textAlign: "inherit",
          animation: animate ? `0.6s ${bounce} ${message.command ? 4 : 1}` : "",
          py: hideAuthor ? 0 : "0.05em",
        }}
      >
        {!hideAuthor && getAvatar(message, players)}
        <ListItemText sx={{ textAlign: "inherit" }}>
          {hideAuthor || message.system ? null : (
            <MessageAuthor message={message} players={players} />
          )}
          <Typography
            color={messageColor(message, players)}
            display="inline"
            variant="inherit"
            sx={{ wordWrap: "break-word", pl: hideAuthor ? 3 : undefined }}
          >
            {children ? children : <MessageContent>{message}</MessageContent>}
          </Typography>
        </ListItemText>
      </ListItem>
    </Component>
  );
};

const MemoizedChatMessage = memo(
  ChatMessage,
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.animate === next.animate &&
    prev.hideAuthor === next.hideAuthor &&
    prev.players === next.players,
);

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

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";

export const MessageContent = ({ children }: { children: IChatMessage }) => {
  if (!children.card && !children.command) {
    const renderedMessage = emoji.replace_colons(children.content);

    return <span dangerouslySetInnerHTML={{ __html: renderedMessage }} />;
  }
  return <ChatButton message={children}>{getMessageContent(children)}</ChatButton>;
};
