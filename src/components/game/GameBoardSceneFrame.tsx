import { Box } from "@mui/material";
import { memo } from "react";
import type { ReactNode } from "react";
import { DesktopCommRail } from "../chat/DesktopCommRail";
import type { useChatRoom } from "../chat/ChatRoom";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { Link } from "../../shared/Link";

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
        maxWidth={{ xs: "4rem", sm: "5rem", md: "6rem" }}
        width={{ xs: "4rem", sm: "5rem", md: "6rem" }}
        left={10}
        top={12}
      >
        <Link to="/">
          <TrucoshiText />
        </Link>
      </Box>
    </Box>
  </Box>
);

export const GameBoardSceneFrame = memo(_GameBoardSceneFrame);
