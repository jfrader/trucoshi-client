import "./PlayButton.css";
import jugarButton from "../../assets/other/trucoshi_jugar.png";
import jugarButtonHover from "../../assets/other/trucoshi_jugar_hover.png";
import { Box, BoxProps } from "@mui/material";

export const PlayButton = ({ ...props }: BoxProps & { disabled?: boolean }) => {
  return (
    <Box
      role="button"
      aria-label="Jugar"
      className={`PlayButton ${props.disabled ? "PlayButton--disabled" : ""}`}
      {...props}
    >
      <img alt="" className="PlayButton_default" src={jugarButton} />
      <img alt="" className="PlayButton_hover" src={jugarButtonHover} />
    </Box>
  );
};
