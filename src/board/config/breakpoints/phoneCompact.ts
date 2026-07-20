import { PHONE_TALL_PROFILE_TOKENS } from "./phoneTall";
import { BoardProfileLayoutTokens } from "./types";

export const PHONE_COMPACT_PROFILE_TOKENS: BoardProfileLayoutTokens = {
  ...PHONE_TALL_PROFILE_TOKENS,
  frame: {
    ...PHONE_TALL_PROFILE_TOKENS.frame,
    boardHeight: "auto",
    boardMaxHeight: "62vh",
    boardAspectRatio: "1 / 1.14",
    topStripGap: "0.66rem",
    topStripMarginBottom: "0.3rem",
  },
  match: {
    ...PHONE_TALL_PROFILE_TOKENS.match,
    topBarTranslateY: "-0.5rem",
    boardTranslateY: "0rem",
    seatBase: {
      ...PHONE_TALL_PROFILE_TOKENS.match.seatBase,
      outwardOffsetY: 3,
      topGroupShiftYPx: 0,
      bottomGroupShiftYPx: 8,
    },
    dock: {
      ...PHONE_TALL_PROFILE_TOKENS.match.dock,
      handCardWidth: "clamp(4.1rem, 11.6dvh, 5.1rem)",
      playedCardWidth: "clamp(3.4rem, 10.7vw, 3.8rem)",
      announcementBlockHeight: "3.65rem",
      announcementTextSizes: {
        tertiary: "0.76rem",
        secondary: "0.84rem",
        primary: "1.12rem",
      },
      handBlockHeight: "5.1rem",
      commandBlockHeight: "3.4rem",
      dockGap: "0.42rem",
      bottomDockReserveHeight: "13.45rem",
      handRowMinHeight: "4.35rem",
      commandCompact: true,
    },
  },
};
