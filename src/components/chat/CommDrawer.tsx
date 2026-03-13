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
import { useMemo, useState } from "react";
import { ChatMessage, ChatRoom, getMessageContent, useChatRoom } from "./ChatRoom";
import { getTeamColor } from "../../utils/team";

type Props = {
  chatProps: ReturnType<typeof useChatRoom>;
  bottomOffset?: string;
};

export const CommDrawer = ({ chatProps, bottomOffset = "calc(env(safe-area-inset-bottom) + 0.2rem)" }: Props) => {
  const [tab, setTab] = useState<"chat" | "announcements">("announcements");

  const room = chatProps.useChatState[0];

  const announcements = useMemo(
    () => (room?.messages || []).filter((message) => message.command || message.system).slice(-40),
    [room?.messages]
  );

  const latestAnnouncement = announcements[announcements.length - 1] || chatProps.latestMessage;
  const latestColor =
    latestAnnouncement?.command && latestAnnouncement?.user?.name !== undefined
      ? `${getTeamColor(Number(latestAnnouncement.user.name))}.light`
      : "grey.100";

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
            onClick={() => chatProps.setActive(true)}
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
            <Tab value="announcements" label="Anuncios" />
            <Tab value="chat" label="Chat" />
          </Tabs>
          <IconButton onClick={() => chatProps.setActive(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box px={1} pb={1} minHeight={0} flex={1} position="relative" overflow="hidden">
          {tab === "chat" ? (
            <ChatRoom alwaysVisible {...chatProps} />
          ) : (
            <List
              component={Paper}
              sx={{
                height: "100%",
                overflowY: "auto",
                bgcolor: "rgba(17,24,22,0.6)",
              }}
            >
              {announcements.length ? (
                announcements.map((message) => (
                  <ChatMessage key={message.id} message={message} players={chatProps.players} />
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={<Typography color="text.secondary">Todavia no hay anuncios.</Typography>}
                  />
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};
