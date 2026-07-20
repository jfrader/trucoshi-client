import { BoardViewportProfile } from "../../types";
import { DESKTOP_PROFILE_TOKENS } from "./desktop";
import { PHONE_COMPACT_PROFILE_TOKENS } from "./phoneCompact";
import { PHONE_TALL_PROFILE_TOKENS } from "./phoneTall";
import { PHONE_WIDE_PROFILE_TOKENS } from "./phoneWide";
import { TABLET_PROFILE_TOKENS } from "./tablet";
import { TABLET_WIDE_PROFILE_TOKENS } from "./tabletWide";
import { BoardProfileLayoutTokens } from "./types";

export const PROFILE_LAYOUT_TOKENS: Record<BoardViewportProfile, BoardProfileLayoutTokens> = {
  phoneCompact: PHONE_COMPACT_PROFILE_TOKENS,
  phoneTall: PHONE_TALL_PROFILE_TOKENS,
  phoneWide: PHONE_WIDE_PROFILE_TOKENS,
  tablet: TABLET_PROFILE_TOKENS,
  tabletWide: TABLET_WIDE_PROFILE_TOKENS,
  desktop: DESKTOP_PROFILE_TOKENS,
};

export {
  DESKTOP_PROFILE_TOKENS,
  PHONE_COMPACT_PROFILE_TOKENS,
  PHONE_TALL_PROFILE_TOKENS,
  PHONE_WIDE_PROFILE_TOKENS,
};
export { TABLET_PROFILE_TOKENS, TABLET_WIDE_PROFILE_TOKENS };
export type { BoardProfileLayoutTokens };
