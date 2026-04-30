import {
  BoardSurface,
  BoardSurfaceFrameConfig,
  BoardViewportProfile,
} from "../types";
import { PROFILE_LAYOUT_TOKENS } from "./breakpoints";

const LOBBY_FRAME_OVERRIDES_BY_PROFILE: Partial<
  Record<BoardViewportProfile, Partial<BoardSurfaceFrameConfig>>
> = {
  phoneWide: {
    boardAspectRatio: "1 / 1",
    boardBorderRadius: "50%",
    boardInnerBorderRadius: "50%",
    boardHeight: "auto",
    seatWidth: "35%",
    seatMaxWidth: "11.7rem",
  },
};

export const getBoardProfileTokens = (profile: BoardViewportProfile) =>
  PROFILE_LAYOUT_TOKENS[profile];

export const getFrameForSurface = (surface: BoardSurface, profile: BoardViewportProfile) => {
  const frame = getBoardProfileTokens(profile).frame;

  if (surface !== "lobby") {
    return frame;
  }

  return {
    ...frame,
    ...(LOBBY_FRAME_OVERRIDES_BY_PROFILE[profile] || {}),
  };
};
