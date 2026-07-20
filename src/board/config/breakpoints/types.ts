import {
  BoardCenterStackConfig,
  BoardSeatGeometryConfig,
  BoardSurfaceFrameConfig,
  LobbySeatCardConfig,
  MatchDockSizingConfig,
  MatchSeatPresentationRules,
} from "../../types";

export type BoardProfileLayoutTokens = {
  frame: BoardSurfaceFrameConfig;
  match: {
    topBarTranslateY: string;
    boardTranslateY: string;
    seatBase: BoardSeatGeometryConfig;
    center: {
      overrides: Partial<Omit<BoardCenterStackConfig, "spreadBoost">>;
      spreadBoost: number;
    };
    dock: MatchDockSizingConfig;
    seatPresentation: MatchSeatPresentationRules;
  };
  lobby: {
    sixPlayerSeat: BoardSeatGeometryConfig;
    fourPlayerMobileSeat: BoardSeatGeometryConfig | null;
    seatCard: LobbySeatCardConfig;
  };
};
