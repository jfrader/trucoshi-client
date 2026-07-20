import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slide,
  ClickAwayListener,
  Typography,
  styled,
  ListItemAvatar,
  type BoxProps,
  type ButtonProps,
  type FadeProps,
  type SlideProps,
} from "@mui/material";
import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  type FC,
  type MouseEvent,
  type PropsWithChildren,
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
import { getTeamColor, getTeamDisplayNameForPlayers } from "../../utils/team";
import { bounce } from "../../assets/animations/bounce";
import { COMMANDS_HUMAN_READABLE } from "../../trucoshi/constants";
import { UserAvatar } from "../../shared/UserAvatar";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import ChatField from "./ChatField";

const ChatBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: number }>(({ active }) => [
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      maxPlayers: match?.options.maxPlayers,
      active,
      setActive,
      latestMessage,
    }),
    [active, latestMessage, match?.options.maxPlayers, match?.players, useChatState],
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
    height: "calc(var(--trucoshi-viewport-height, 100dvh) - 48px)",
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
  maxPlayers,
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
      if (listRef.current.scrollTo) {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight });
      } else {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [filteredMessages.length]);

  const onActivate = (event: MouseEvent) => {
    event.stopPropagation();
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
            message.date * 1000 - prevMessage.date * 1000 <= MESSAGE_GROUPING_THRESHOLD,
        );

        return { message, hideAuthor: isConsecutive };
      }),
    [filteredMessages],
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
        sx={(theme) => ({
          zIndex: theme.zIndex.appBar,
          overflow: "hidden",
        })}
        {...boxProps}
      >
        <List
          component={Paper}
          ref={listRef}
          sx={(theme) => ({
            justifyContent: "flex-end",
            m: 0,
            ...theme.trucoshiUi.chatDrawer.chatMessages,
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
              maxPlayers={maxPlayers}
              hideAuthor={hideAuthor}
            />
          ))}
        </List>
        {hideInput ? null : (
          <ChatField
            alwaysVisible={alwaysVisible}
            active={active}
            isLoading={isLoading}
            chat={chat}
          />
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
  maxPlayers,
}: {
  message: IChatMessage;
  players?: Array<IPublicPlayer>;
  maxPlayers?: IPublicMatch["options"]["maxPlayers"];
}) => {
  const color = authorColor(message, players);
  const teamIdx = Number(message.user.key) as 0 | 1;

  return (
    <Typography color={color} display="inline" variant="inherit">
      {message.command
        ? `${getTeamDisplayNameForPlayers(players, teamIdx, maxPlayers === 2)} `
        : message.user.name + ": "}
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
  maxPlayers,
  animate = false,
  hideAuthor = false,
  Component = Slide,
  ...props
}: PropsWithChildren<
  {
    message: IChatMessage;
    players?: Array<IPublicPlayer>;
    maxPlayers?: IPublicMatch["options"]["maxPlayers"];
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
            <MessageAuthor message={message} players={players} maxPlayers={maxPlayers} />
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
    prev.maxPlayers === next.maxPlayers &&
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

export const MessageContent = ({ children }: { children: IChatMessage }) => {
  if (!children.card && !children.command) {
    return <span>{children.content}</span>;
  }
  return <ChatButton message={children}>{getMessageContent(children)}</ChatButton>;
};
