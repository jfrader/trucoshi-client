import { Box } from "@mui/material";
import { memo } from "react";
import type { ReactNode } from "react";
import { DesktopCommRail } from "../chat/DesktopCommRail";
import type { useChatRoom } from "../chat/ChatRoom";
import { TrucoshiResponsiveLogoLink } from "../../shared/TrucoshiResponsiveLogoLink";

type GameBoardSceneFrameProps = {
  chatProps: ReturnType<typeof useChatRoom>;
  isDesktopChat: boolean;
  children: ReactNode;
};

const _GameBoardSceneFrame = ({ chatProps, isDesktopChat, children }: GameBoardSceneFrameProps) => (
  <Box
    sx={(theme) => ({
      height: "100%",
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: isDesktopChat
        ? `${theme.trucoshiUi.chatDrawer.railWidth} minmax(0, 1fr)`
        : "minmax(0, 1fr)",
      gap: 0,
      p: 0,
      boxSizing: "border-box",
    })}
  >
    {isDesktopChat ? <DesktopCommRail chatProps={chatProps} /> : null}
    <Box position="relative" minWidth={0} minHeight={0}>
      {children}
      <Box
        zIndex={(theme) => theme.zIndex.drawer}
        position="absolute"
        left={10}
        top={12}
      >
        <TrucoshiResponsiveLogoLink size={28} />
      </Box>
    </Box>
  </Box>
);

export const GameBoardSceneFrame = memo(_GameBoardSceneFrame);
