import { Box } from "@mui/material";
import chestSprite from "../../assets/treasure/chest-opening-spritesheet-2.png";

export const CHEST_FRAME_COUNT = 8;
export const CHEST_FRAME_PAUSE_MS = 180;
export const CHEST_FRAME_STEP_MS = 110;
export const CHEST_ANIMATION_MS = CHEST_FRAME_PAUSE_MS + CHEST_FRAME_STEP_MS * (CHEST_FRAME_COUNT - 1);

// The new 2508x627 sheet contains eight 313.5px-wide square frames centered
// vertically in a canvas that is two frame-heights tall. Zooming the sheet to
// 200% vertically preserves the artwork's aspect ratio; 52.5% selects the
// occupied square strip without clipping the tallest open-chest frame.
export const CHEST_SPRITE_BACKGROUND_SIZE = `${CHEST_FRAME_COUNT * 100}% 200%`;
const CHEST_FRAME_Y_POSITION = "52.5%";

export const getChestFramePosition = (frame: number) =>
  `${(Math.min(Math.max(frame, 0), CHEST_FRAME_COUNT - 1) / (CHEST_FRAME_COUNT - 1)) * 100}% ${CHEST_FRAME_Y_POSITION}`;

export const ChestFrame = ({
  frame,
  size = "min(78vw, 23rem)",
  mini = false,
}: {
  frame: number;
  size?: string;
  mini?: boolean;
}) => (
  <Box
    aria-hidden
    data-frame={frame}
    data-testid={mini ? "treasure-mini-chest" : "treasure-chest-sprite"}
    sx={(theme) => ({
      width: size,
      aspectRatio: "1 / 1",
      backgroundImage: `url(${chestSprite})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: CHEST_SPRITE_BACKGROUND_SIZE,
      backgroundPosition: getChestFramePosition(frame),
      filter: mini
        ? "drop-shadow(0 6px 8px rgba(0,0,0,0.35))"
        : theme.trucoshiUi.treasure.chestShadow,
      transformOrigin: "50% 82%",
      transition: mini ? "none" : "transform 90ms ease-out",
    })}
  />
);
