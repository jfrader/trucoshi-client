import { Box, Paper, Stack, Tab, Tabs, styled } from "@mui/material";
import { useMemo, useState } from "react";
import { ChatRoom, useChatRoom } from "./ChatRoom";
import { CommTabName, FILTER_BY_TAB } from "./commTabs";

type Props = {
  chatProps: ReturnType<typeof useChatRoom>;
};

const RailRoot = styled(Paper)(({ theme }) => ({
  position: "relative",
  height: "100%",
  minHeight: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  borderRadius: "1rem",
  border: theme.trucoshiUi.chatDrawer.railBorder,
  background: theme.trucoshiUi.chatDrawer.railBackground,
  boxShadow: theme.trucoshiUi.chatDrawer.railShadow,
  backdropFilter: "blur(1px)",
}));

const RailHeader = styled(Stack)(({ theme }) => ({
  borderBottom: theme.trucoshiUi.chatDrawer.railHeaderBorderBottom,
  background: theme.trucoshiUi.chatDrawer.railHeaderBackground,
  padding: theme.spacing(0.8, 1, 0),
}));

export const DesktopCommRail = ({ chatProps }: Props) => {
  const [tab, setTab] = useState<CommTabName>("all");

  const messageFilter = useMemo(() => FILTER_BY_TAB[tab], [tab]);

  return (
    <RailRoot>
      <RailHeader direction="row" alignItems="center" justifyContent="space-between">
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ minHeight: 0, "& .MuiTab-root": { fontSize: "0.84rem", minHeight: "2.1rem" } }}
        >
          <Tab value="all" label="Todo" />
          <Tab value="chat" label="Chat" />
          <Tab value="system" label="Sistema" />
        </Tabs>
      </RailHeader>

      <Box position="relative" minHeight={0} flex={1} overflow="hidden">
        <ChatRoom alwaysVisible {...chatProps} messageFilter={messageFilter} />
      </Box>
    </RailRoot>
  );
};
