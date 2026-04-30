export type BoardSurface = "match" | "lobby";

export type BoardViewportProfile = "phoneTall" | "phoneWide" | "tablet" | "tabletWide" | "desktop";

export type BoardPlayerCount = 2 | 4 | 6;

export type BoardViewport = {
  width: number;
  height: number;
  aspectRatio: number;
};

export type BoardSeatGeometryConfig = {
  radiusXMultiplier: number;
  radiusYMultiplier: number;
  sideWeightedYMultiplier: boolean;
  outwardOffsetX: number;
  outwardOffsetY: number;
  sideInset: number;
  sideVerticalOffset: number;
  angleOffsetDeg: number;
  sideAngleOffsetDeg: number;
  topGroupShiftYPx: number;
  bottomGroupShiftYPx: number;
};

export type BoardSeatGeometry = {
  index: number;
  totalSeats: number;
  angleDeg: number;
  angleRad: number;
  cos: number;
  sin: number;
  sideStrength: number;
  leftPercent: number;
  topPercent: number;
  groupShiftY: number;
  seatShiftX: number;
  seatShiftY: number;
};

export type SeatHandTransform = {
  x: number;
  y: number;
  rotate: number;
  origin: string;
};

export type OpponentHiddenHandCardTransform = {
  x: number;
  y: number;
  rotateDeg: number;
  zIndex: number;
};

export type OpponentHiddenHandLayout = {
  anchor: {
    x: number;
    y: number;
    rotateDeg: number;
    origin: string;
  };
  cards: OpponentHiddenHandCardTransform[];
};

export type SeatOffsetVector = {
  x: number;
  y: number;
};

export type BoardSurfaceFrameConfig = {
  rootPadding: string;
  shellMaxWidth: string;
  topStripGap: string;
  topStripMarginBottom: string;
  bottomStripMarginTop: string;
  boardWidth: string;
  boardMaxWidth: string;
  boardHeight: string;
  boardMaxHeight: string;
  boardAspectRatio: string;
  boardBorderRadius: string;
  boardInnerBorderRadius: string;
  boardBorderWidth: string;
  boardOutlineWidth: string;
  centerSize: string;
  seatWidth: string;
  seatMaxWidth: string;
};

export type BoardCenterStackConfig = {
  centerShiftXPercent: number;
  centerShiftYPercent: number;
  playerSpreadXPercent: number;
  playerSpreadYPercent: number;
  spreadBoost: number;
  maxJitterPx: number;
  maxRotationOffsetDeg: number;
  facePlayerRotation: boolean;
};

export type MatchDockSizingConfig = {
  handCardWidth: string;
  playedCardWidth: string;
  announcementBlockHeight: string;
  handBlockHeight: string;
  commandBlockHeight: string;
  dockGap: string;
  dockBottomOffset: string;
  bottomDockReserveHeight: string;
  handRowMinHeight: string;
  handRowTranslateY: string;
  commandCompact: boolean;
};

export type HiddenHandRadialRules = {
  tableInsetPx: number;
  axialInsetReductionPx: number;
  distanceScale: number;
  verticalLiftPx: number;
  fanSpacingPx: number;
  fanArcDepthPx: number;
  fanSpreadDeg: number;
  minClearancePx: number;
  handOrigin: string;
};

export type MatchSeatPresentationRules = {
  meTranslateY: number;
  lowerSideTranslateY: number;
  topSeatAvatarNudgeY: number;
  hideTopSeatAvatarNudgeOnProfiles: BoardViewportProfile[];
  hiddenHandCardWidth: string;
  hiddenHandScale: number;
  hiddenHandRules: HiddenHandRadialRules;
  tablePoints?: Partial<TablePointsPlacementRules>;
};

export type TablePointsPlacementRules = {
  sideOffsetDesktopPx: number;
  sideOffsetMobilePx: number;
  inwardNudgePx: number;
  tiltDesktopDeg: number;
  tiltMobileDeg: number;
  imageHeightDesktop: string;
  imageHeightMobile: string;
  pileGap: string;
};

export type MatchLayoutConfig = {
  dock: MatchDockSizingConfig;
  seatPresentation: MatchSeatPresentationRules;
};

export type LobbySeatCardConfig = {
  minWidth: string;
  padding: string;
  borderRadius: string;
  headerHeight: string;
  cardsHeight: string;
  actionsHeight: string;
  hiddenCardWidth: string;
  hiddenCardOverlap: number;
};

export type LobbyLayoutConfig = {
  seatCard: LobbySeatCardConfig;
};

export type BoardLayoutModel = {
  surface: BoardSurface;
  profile: BoardViewportProfile;
  playerCount: BoardPlayerCount;
  viewport: BoardViewport;
  frame: BoardSurfaceFrameConfig;
  seatConfig: BoardSeatGeometryConfig;
  seatGeometries: BoardSeatGeometry[];
  centerStack: BoardCenterStackConfig;
  match: MatchLayoutConfig | null;
  lobby: LobbyLayoutConfig | null;
};

export type MatchSeatPresentation = {
  translateY: number;
  avatarNudgeY: number;
  hiddenHandCardWidth: string;
  hiddenHandScale: number;
  hiddenHandRules: HiddenHandRadialRules;
  tablePoints: TablePointsPlacementRules;
};
