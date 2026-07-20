import { Box, Paper, Stack, Tab, Tabs, Typography, styled } from "@mui/material";
import { useState } from "react";
import { ChatRoom, useChatRoom } from "./ChatRoom";
import { CommTabName, FILTER_BY_TAB } from "./commTabs";
import { useBoardLayout, useMatchState } from "../../board";
import { IS_DEBUG } from "../../config/debug";

type Props = {
  chatProps: ReturnType<typeof useChatRoom>;
};

const RailRoot = styled(Paper)(() => ({
  position: "relative",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backdropFilter: "blur(1px)",
}));

const RailHeader = styled(Stack)(({ theme }) => ({
  borderBottom: theme.trucoshiUi.chatDrawer.railHeaderBorderBottom,
  background: theme.trucoshiUi.chatDrawer.railHeaderBackground,
  padding: theme.spacing(0.8, 1, 0),
}));

export const DesktopCommRail = ({ chatProps }: Props) => {
  const [tab, setTab] = useState<CommTabName>("all");

  const messageFilter = FILTER_BY_TAB[tab];

  return (
    <RailRoot>
      <RailHeader direction="row" alignItems="center" justifyContent="space-between">
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            minHeight: 0,
            "& .MuiTab-root": {
              fontSize: "0.78rem",
              minHeight: "2.1rem",
              px: 0.75,
            },
          }}
        >
          <Tab value="all" label="Todo" />
          <Tab value="chat" label="Chat" />
          <Tab value="system" label="Sistema" />
          {IS_DEBUG ? <Tab value="debug" label="Debug" /> : null}
        </Tabs>
      </RailHeader>

      <Box
        className="ChatRoom_container"
        position="relative"
        minHeight={0}
        flex={1}
        overflow="hidden"
      >
        {tab === "debug" ? (
          <RailDebugPanel />
        ) : (
          <ChatRoom alwaysVisible {...chatProps} messageFilter={messageFilter} />
        )}
      </Box>
    </RailRoot>
  );
};

const RailDebugPanel = () => {
  const layout = useBoardLayout();
  const match = useMatchState();

  return (
    <Box p={1.2} height="100%" overflow="auto" sx={{ fontFamily: "monospace" }}>
      <Typography variant="subtitle2" fontWeight={800} mb={1}>
        Debug
      </Typography>
      <Typography variant="body2">view_profile: {layout.profile}</Typography>
      <Typography variant="body2">surface: {layout.surface}</Typography>
      <Typography variant="body2">player_count: {layout.playerCount}</Typography>
      <Typography variant="body2">hand_state: {match?.handState || "n/a"}</Typography>
      <Typography variant="body2">match_state: {match?.state || "n/a"}</Typography>
    </Box>
  );
};
