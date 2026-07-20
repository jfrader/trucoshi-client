import { useMemo } from "react";
import {
  BoardLayoutModel,
  BoardPlayerCount,
  BoardSeatGeometryConfig,
  BoardSurface,
  BoardViewport,
  MatchSeatPresentation,
} from "../types";
import { buildSeatGeometries, mergeSeatConfig } from "../geometry";
import { normalizeBoardPlayerCount, resolveBoardViewportProfile, useBoardViewport } from "../viewport";
import {
  DEFAULT_HIDDEN_HAND_RADIAL_RULES,
  DEFAULT_SEAT_CONFIG,
  DEFAULT_TABLE_POINTS_PLACEMENT_RULES,
  EMPTY_CENTER_STACK,
  DEFAULT_MATCH_CENTER_BASE,
  DEFAULT_MATCH_FOUR_PLAYER_SEAT_OVERRIDES,
  DEFAULT_MATCH_TWO_PLAYER_SEAT_OVERRIDES,
  MATCH_CENTER_OVERRIDES_BY_PLAYER_COUNT,
  getBoardProfileTokens,
  getFrameForSurface,
} from "../tokens";

type ProfileTokens = ReturnType<typeof getBoardProfileTokens>;

type SeatConfigResolver = (args: {
  profile: BoardLayoutModel["profile"];
  profileTokens: ProfileTokens;
}) => BoardSeatGeometryConfig;

const DEFAULT_SEAT = () => mergeSeatConfig(DEFAULT_SEAT_CONFIG);

const MATCH_SEAT_OVERRIDES_BY_PLAYER_COUNT: Partial<
  Record<BoardPlayerCount, Partial<BoardSeatGeometryConfig>>
> = {
  2: DEFAULT_MATCH_TWO_PLAYER_SEAT_OVERRIDES,
  4: DEFAULT_MATCH_FOUR_PLAYER_SEAT_OVERRIDES,
};

const LOBBY_SEAT_CONFIG_BY_PLAYER_COUNT: Record<BoardPlayerCount, SeatConfigResolver> = {
  2: () => DEFAULT_SEAT(),
  4: ({ profile, profileTokens }) =>
    profile !== "desktop" ? profileTokens.lobby.fourPlayerMobileSeat || DEFAULT_SEAT() : DEFAULT_SEAT(),
  6: ({ profileTokens }) => profileTokens.lobby.sixPlayerSeat,
};

export const getMatchSeatPresentationForIndex = ({
  layout,
  seatIndex,
  isMe,
}: {
  layout: BoardLayoutModel;
  seatIndex: number;
  isMe: boolean;
}): MatchSeatPresentation => {
  if (!layout.match) {
    return {
      avatarFrameSizePx: 56,
      translateY: 0,
      avatarNudgeY: 0,
      hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
      hiddenHandScale: 1,
      hiddenHandRules: {
        ...DEFAULT_HIDDEN_HAND_RADIAL_RULES,
      },
      tablePoints: {
        ...DEFAULT_TABLE_POINTS_PLACEMENT_RULES,
      },
    };
  }

  const { seatPresentation } = layout.match;

  const isLowerSideSeat = layout.playerCount === 6 && (seatIndex === 1 || seatIndex === 5);
  const isTopSeat = layout.playerCount === 6 && seatIndex === 3;

  const translateY = isMe
    ? seatPresentation.meTranslateY
    : isLowerSideSeat
      ? seatPresentation.lowerSideTranslateY
      : 0;

  const avatarNudgeBlocked = seatPresentation.hideTopSeatAvatarNudgeOnProfiles.includes(
    layout.profile,
  );
  const avatarNudgeY = isTopSeat && !avatarNudgeBlocked ? seatPresentation.topSeatAvatarNudgeY : 0;

  return {
    avatarFrameSizePx: seatPresentation.avatarFrameSizePx,
    translateY,
    avatarNudgeY,
    hiddenHandCardWidth: seatPresentation.hiddenHandCardWidth,
    hiddenHandScale: seatPresentation.hiddenHandScale,
    hiddenHandRules: seatPresentation.hiddenHandRules,
    tablePoints: {
      ...DEFAULT_TABLE_POINTS_PLACEMENT_RULES,
      ...(seatPresentation.tablePoints || {}),
    },
  };
};

const buildMatchLayoutModel = ({
  profile,
  playerCount,
  surface,
  viewport,
  frame,
  totalSeatCount,
}: {
  profile: BoardLayoutModel["profile"];
  playerCount: BoardPlayerCount;
  surface: BoardSurface;
  viewport: BoardViewport;
  frame: BoardLayoutModel["frame"];
  totalSeatCount: number;
}): BoardLayoutModel => {
  const profileTokens = getBoardProfileTokens(profile);
  const baseSeat = profileTokens.match.seatBase;
  const seatConfig = mergeSeatConfig(baseSeat, MATCH_SEAT_OVERRIDES_BY_PLAYER_COUNT[playerCount]);
  const seatGeometries = buildSeatGeometries({ totalSeats: totalSeatCount, config: seatConfig });

  return {
    surface,
    profile,
    playerCount,
    viewport,
    frame,
    seatConfig,
    seatGeometries,
    centerStack: {
      ...DEFAULT_MATCH_CENTER_BASE,
      ...(profileTokens.match.center.overrides || {}),
      spreadBoost: profileTokens.match.center.spreadBoost,
      ...(MATCH_CENTER_OVERRIDES_BY_PLAYER_COUNT[playerCount] || {}),
    },
    match: {
      topBarTranslateY: profileTokens.match.topBarTranslateY,
      boardTranslateY: profileTokens.match.boardTranslateY,
      dock: profileTokens.match.dock,
      seatPresentation: profileTokens.match.seatPresentation,
    },
    lobby: null,
  };
};

const buildLobbyLayoutModel = ({
  profile,
  playerCount,
  surface,
  viewport,
  frame,
  totalSeatCount,
}: {
  profile: BoardLayoutModel["profile"];
  playerCount: BoardPlayerCount;
  surface: BoardSurface;
  viewport: BoardViewport;
  frame: BoardLayoutModel["frame"];
  totalSeatCount: number;
}): BoardLayoutModel => {
  const profileTokens = getBoardProfileTokens(profile);
  const seatConfig = LOBBY_SEAT_CONFIG_BY_PLAYER_COUNT[playerCount]({
    profile,
    profileTokens,
  });

  const seatGeometries = buildSeatGeometries({ totalSeats: totalSeatCount, config: seatConfig });

  return {
    surface,
    profile,
    playerCount,
    viewport,
    frame,
    seatConfig,
    seatGeometries,
    centerStack: EMPTY_CENTER_STACK,
    match: null,
    lobby: {
      seatCard: profileTokens.lobby.seatCard,
    },
  };
};

const SURFACE_MODEL_BUILDERS: Record<
  BoardSurface,
  (args: {
    profile: BoardLayoutModel["profile"];
    playerCount: BoardPlayerCount;
    surface: BoardSurface;
    viewport: BoardViewport;
    frame: BoardLayoutModel["frame"];
    totalSeatCount: number;
  }) => BoardLayoutModel
> = {
  match: (args) => buildMatchLayoutModel(args),
  lobby: (args) => buildLobbyLayoutModel(args),
};

export const buildBoardLayoutModel = ({
  surface,
  totalSeats,
  viewport,
}: {
  surface: BoardSurface;
  totalSeats: number;
  viewport: BoardViewport;
}): BoardLayoutModel => {
  const profile = resolveBoardViewportProfile(viewport);
  const frame = getFrameForSurface(surface, profile);
  const playerCount = normalizeBoardPlayerCount(totalSeats);
  const totalSeatCount = Math.max(totalSeats, 2);

  return SURFACE_MODEL_BUILDERS[surface]({
    profile,
    playerCount,
    surface,
    viewport,
    frame,
    totalSeatCount,
  });
};

export const useBoardLayoutModel = ({
  surface,
  totalSeats,
}: {
  surface: BoardSurface;
  totalSeats: number;
}) => {
  const viewport = useBoardViewport();

  return useMemo(
    () =>
      buildBoardLayoutModel({
        surface,
        totalSeats,
        viewport,
      }),
    [surface, totalSeats, viewport],
  );
};
