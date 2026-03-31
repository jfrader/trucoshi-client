import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import { useMemo, useState } from "react";
import { ChatMessage, ChatRoom, getMessageContent, useChatRoom } from "./ChatRoom";
import { getTeamColor } from "../../utils/team";

type Props = {
  chatProps: ReturnType<typeof useChatRoom>;
  bottomOffset?: string;
  variant?: "announcement" | "chatEmotes";
  compact?: boolean;
};

type TabName = "all" | "chat" | "system";

export const CommDrawer = ({
  chatProps,
  bottomOffset = "calc(env(safe-area-inset-bottom) + 0.2rem)",
  variant = "announcement",
  compact = false,
}: Props) => {
  const [tab, setTab] = useState<TabName>(variant === "chatEmotes" ? "chat" : "all");

  const room = chatProps.useChatState[0];

  const systemMessages = useMemo(
    () =>
      (room?.messages || [])
        .filter((message) => message.command || message.system || message.card)
        .slice(-80),
    [room?.messages]
  );

  const latestAnnouncement = systemMessages[systemMessages.length - 1] || chatProps.latestMessage;
  const latestColor =
    latestAnnouncement?.command && latestAnnouncement?.user?.key !== undefined
      ? `${getTeamColor(Number(latestAnnouncement.user.key))}.light`
      : "grey.100";

  const onlyChatFilter = useMemo(
    () => (message: { command?: unknown; system?: unknown; card?: unknown }) =>
      !message.command && !message.system && !message.card,
    []
  );

  const openDrawer = (nextTab: TabName) => {
    setTab(nextTab);
    chatProps.setActive(true);
  };

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        left: theme.spacing(0.35),
        right: theme.spacing(0.35),
        bottom: bottomOffset,
        zIndex: theme.zIndex.drawer,
        maxWidth: "36rem",
        margin: "0 auto",
        [theme.breakpoints.up("sm")]: {
          left: theme.spacing(0.6),
          right: theme.spacing(0.6),
        },
      })}
    >
      {variant === "chatEmotes" ? (
        <Paper
          sx={{
            borderRadius: { xs: "0.5rem", sm: "0.56rem", md: "0.6rem", lg: compact ? "0.56rem" : "0.64rem" },
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(180deg, rgba(92,58,34,0.95), rgba(63,39,24,0.98) 40%, rgba(42,27,17,0.98))",
            boxShadow: "0 8px 18px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
            px: { xs: 0.28, sm: 0.34, md: 0.42, lg: compact ? 0.4 : 0.55 },
            py: { xs: 0.24, sm: 0.3, md: 0.36, lg: compact ? 0.32 : 0.5 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.34, sm: 0.42, md: 0.5, lg: compact ? 0.45 : 0.6 }}>
            <Button
              variant="contained"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={() => openDrawer("chat")}
              sx={{
                flex: 1,
                borderRadius: "999px",
                justifyContent: "flex-start",
                minHeight: { xs: "1.92rem", sm: "2rem", md: "2.08rem", lg: compact ? "2.06rem" : "2.16rem" },
                px: { xs: 0.74, sm: 0.82, md: 0.92, lg: compact ? 0.9 : 1.1 },
                py: { xs: 0.2, sm: 0.24, md: 0.28, lg: compact ? 0.3 : 0.45 },
                fontSize: { xs: "0.74rem", sm: "0.78rem", md: "0.82rem", lg: compact ? "0.84rem" : "0.94rem" },
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                border: "1px solid rgba(255,255,255,0.2)",
                background:
                  "linear-gradient(165deg, rgba(52,52,48,0.97), rgba(31,30,28,0.97))",
                boxShadow: "0 6px 12px rgba(0,0,0,0.35)",
                flexShrink: 0,
                "& .MuiButton-startIcon": { marginRight: { xs: 0.24, sm: 0.3, md: 0.36, lg: compact ? 0.32 : 0.45 } },
                "& .MuiSvgIcon-root": { fontSize: { xs: "0.94rem", sm: "0.98rem", md: "1.02rem", lg: compact ? "1rem" : "1.12rem" } },
              }}
            >
              Chat
            </Button>

            <Button
              variant="contained"
              startIcon={<EmojiEmotionsOutlinedIcon />}
              onClick={() => openDrawer("chat")}
              sx={{
                flex: 1,
                borderRadius: "999px",
                justifyContent: "flex-start",
                minHeight: { xs: "1.92rem", sm: "2rem", md: "2.08rem", lg: compact ? "2.06rem" : "2.16rem" },
                px: { xs: 0.74, sm: 0.82, md: 0.92, lg: compact ? 0.9 : 1.1 },
                py: { xs: 0.2, sm: 0.24, md: 0.28, lg: compact ? 0.3 : 0.45 },
                fontSize: { xs: "0.74rem", sm: "0.78rem", md: "0.82rem", lg: compact ? "0.84rem" : "0.94rem" },
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                border: "1px solid rgba(255,255,255,0.2)",
                background:
                  "linear-gradient(165deg, rgba(52,52,48,0.97), rgba(31,30,28,0.97))",
                boxShadow: "0 6px 12px rgba(0,0,0,0.35)",
                flexShrink: 0,
                "& .MuiButton-startIcon": { marginRight: { xs: 0.24, sm: 0.3, md: 0.36, lg: compact ? 0.32 : 0.45 } },
                "& .MuiSvgIcon-root": { fontSize: { xs: "0.94rem", sm: "0.98rem", md: "1.02rem", lg: compact ? "1rem" : "1.12rem" } },
              }}
            >
              Emotes
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper
          sx={{
            borderRadius: "1rem",
            border: "1px solid rgba(255,255,255,0.12)",
            bgcolor: "rgba(9,16,14,0.94)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
            px: 1.45,
            py: 1.1,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.8} minWidth={0}>
              <CampaignOutlinedIcon sx={{ fontSize: { xs: "1.32rem", sm: "1.15rem" } }} color="warning" />
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
              onClick={() => openDrawer("system")}
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
        </Paper>
      )}

      <Drawer
        anchor="bottom"
        open={chatProps.active}
        onClose={() => chatProps.setActive(false)}
        PaperProps={{
          sx: {
            height: "min(68vh, 36rem)",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
            background: "linear-gradient(180deg, rgba(17,24,22,0.98), rgba(9,14,13,0.99))",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          },
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
          {tab === "system" ? (
            <List
              component={Paper}
              sx={{
                height: "100%",
                overflowY: "auto",
                bgcolor: "rgba(17,24,22,0.6)",
                borderRadius: 0,
              }}
            >
              {systemMessages.length ? (
                systemMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} players={chatProps.players} />
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={<Typography color="text.secondary">Todavia no hay mensajes de sistema.</Typography>}
                  />
                </ListItem>
              )}
            </List>
          ) : (
            <ChatRoom
              alwaysVisible
              {...chatProps}
              messageFilter={tab === "chat" ? onlyChatFilter : undefined}
            />
          )}
        </Box>
      </Drawer>
    </Box>
  );
};
