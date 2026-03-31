import {
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  styled,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import { SvgIconComponent } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { ChatRoom, getMessageContent, useChatRoom } from "./ChatRoom";
import { getTeamColor } from "../../utils/team";

type Props = {
  chatProps: ReturnType<typeof useChatRoom>;
  bottomOffset?: string;
  variant?: "announcement" | "chatEmotes";
  compact?: boolean;
};

type TabName = "all" | "chat" | "system";
type DrawerMessage = { command?: unknown; system?: unknown; card?: unknown };
type MessageFilter = (message: DrawerMessage) => boolean;

const DrawerContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: theme.spacing(0.35),
  right: theme.spacing(0.35),
  zIndex: theme.zIndex.drawer,
  maxWidth: "36rem",
  margin: "0 auto",
  [theme.breakpoints.up("sm")]: {
    left: theme.spacing(0.6),
    right: theme.spacing(0.6),
  },
}));

const ChatActionsPaper = styled(Paper)(({ theme }) => ({
  border: theme.trucoshiUi.chatDrawer.actionsPanelBorder,
  background: theme.trucoshiUi.chatDrawer.actionsPanelBackground,
  boxShadow: theme.trucoshiUi.chatDrawer.actionsPanelShadow,
}));

const AnnouncementPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "1rem",
  border: theme.trucoshiUi.chatDrawer.announcementPanelBorder,
  backgroundColor: theme.trucoshiUi.chatDrawer.announcementPanelBackground,
  boxShadow: theme.trucoshiUi.chatDrawer.announcementPanelShadow,
  padding: "0.55rem 0.725rem",
}));

const FILTER_BY_TAB: Partial<Record<TabName, MessageFilter>> = {
  chat: (message) => !message.command && !message.system && !message.card,
  system: (message) => Boolean(message.command || message.system || message.card),
};

type QuickAction = {
  label: string;
  icon: SvgIconComponent;
  tab: TabName;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Chat", icon: ChatBubbleOutlineIcon, tab: "chat" },
  { label: "Emotes", icon: EmojiEmotionsOutlinedIcon, tab: "chat" },
];

const QuickActionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "compact",
})<{ compact: boolean }>(({ compact, theme }) => ({
  flex: 1,
  borderRadius: "999px",
  justifyContent: "flex-start",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  flexShrink: 0,
  border: theme.trucoshiUi.chatDrawer.actionButtonBorder,
  background: theme.trucoshiUi.chatDrawer.actionButtonBackground,
  boxShadow: theme.trucoshiUi.chatDrawer.actionButtonShadow,
  minHeight: "2.08rem",
  paddingInline: "0.92rem",
  paddingBlock: "0.28rem",
  fontSize: "0.82rem",
  "& .MuiButton-startIcon": {
    marginRight: "0.36rem",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.02rem",
  },
  [theme.breakpoints.down("sm")]: {
    minHeight: "1.92rem",
    paddingInline: "0.74rem",
    paddingBlock: "0.2rem",
    fontSize: "0.74rem",
    "& .MuiButton-startIcon": {
      marginRight: "0.24rem",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "0.94rem",
    },
  },
  [theme.breakpoints.between("sm", "md")]: {
    minHeight: "2rem",
    paddingInline: "0.82rem",
    paddingBlock: "0.24rem",
    fontSize: "0.78rem",
    "& .MuiButton-startIcon": {
      marginRight: "0.3rem",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "0.98rem",
    },
  },
  [theme.breakpoints.up("lg")]: {
    minHeight: compact ? "2.06rem" : "2.16rem",
    paddingInline: compact ? "0.9rem" : "1.1rem",
    paddingBlock: compact ? "0.3rem" : "0.45rem",
    fontSize: compact ? "0.84rem" : "0.94rem",
    "& .MuiButton-startIcon": {
      marginRight: compact ? "0.32rem" : "0.45rem",
    },
    "& .MuiSvgIcon-root": {
      fontSize: compact ? "1rem" : "1.12rem",
    },
  },
}));

export const CommDrawer = ({
  chatProps,
  bottomOffset = "calc(env(safe-area-inset-bottom) + 0.2rem)",
  variant = "announcement",
  compact = false,
}: Props) => {
  const [tab, setTab] = useState<TabName>(() => (variant === "chatEmotes" ? "chat" : "all"));

  const room = chatProps.useChatState[0];

  const systemMessages = useMemo(
    () =>
      (room?.messages || [])
        .filter((message) => message.command || message.system || message.card)
        .slice(-80),
    [room?.messages],
  );

  const latestAnnouncement = systemMessages[systemMessages.length - 1] || chatProps.latestMessage;
  const latestColor =
    latestAnnouncement?.command && latestAnnouncement?.user?.key !== undefined
      ? `${getTeamColor(Number(latestAnnouncement.user.key))}.light`
      : "grey.100";

  const openDrawer = (nextTab?: TabName) => {
    nextTab && setTab(nextTab);
    chatProps.setActive(true);
  };

  return (
    <DrawerContainer sx={{ bottom: bottomOffset }}>
      {variant === "chatEmotes" ? (
        <ChatActionsPaper
          sx={{
            borderRadius: {
              xs: "0.5rem",
              sm: "0.56rem",
              md: "0.6rem",
              lg: compact ? "0.56rem" : "0.64rem",
            },
            px: { xs: 0.28, sm: 0.34, md: 0.42, lg: compact ? 0.4 : 0.55 },
            py: { xs: 0.24, sm: 0.3, md: 0.36, lg: compact ? 0.32 : 0.5 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 0.34, sm: 0.42, md: 0.5, lg: compact ? 0.45 : 0.6 }}
          >
            {QUICK_ACTIONS.map(({ label, icon: Icon, tab: targetTab }) => (
              <QuickActionButton
                key={label}
                variant="contained"
                startIcon={<Icon />}
                onClick={() => openDrawer(targetTab)}
                compact={compact}
              >
                {label}
              </QuickActionButton>
            ))}
          </Stack>
        </ChatActionsPaper>
      ) : (
        <AnnouncementPaper>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.8} minWidth={0}>
              <CampaignOutlinedIcon
                sx={{ fontSize: { xs: "1.32rem", sm: "1.15rem" } }}
                color="warning"
              />
              <Typography
                color={latestColor}
                fontWeight={800}
                sx={{
                  fontSize: { xs: "1.22rem", sm: "1.06rem" },
                  lineHeight: 1.12,
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {latestAnnouncement ? getMessageContent(latestAnnouncement) : "Sin novedades"}
              </Typography>
            </Stack>
            <Button
              size="small"
              variant="contained"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={() => openDrawer()}
              sx={{
                whiteSpace: "nowrap",
                borderRadius: "999px",
                px: 1.8,
                fontSize: { xs: "0.96rem", sm: "0.9rem" },
                flexShrink: 0,
              }}
            >
              Abrir
            </Button>
          </Stack>
        </AnnouncementPaper>
      )}

      <Drawer
        anchor="bottom"
        open={chatProps.active}
        onClose={() => chatProps.setActive(false)}
        PaperProps={{
          sx: (theme) => ({
            height: "min(68vh, 36rem)",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
            background: theme.trucoshiUi.chatDrawer.drawerPanelBackground,
            borderTop: theme.trucoshiUi.chatDrawer.drawerPanelBorderTop,
          }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" px={1} pt={0.8}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ "& .MuiTab-root": { fontSize: "0.92rem" } }}
          >
            <Tab value="all" label="Todo" />
            <Tab value="chat" label="Chat" />
            <Tab value="system" label="Sistema" />
          </Tabs>
          <IconButton onClick={() => chatProps.setActive(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box px={0} pb={0} minHeight={0} flex={1} position="relative" overflow="hidden">
          <ChatRoom alwaysVisible {...chatProps} messageFilter={FILTER_BY_TAB[tab]} />
        </Box>
      </Drawer>
    </DrawerContainer>
  );
};
