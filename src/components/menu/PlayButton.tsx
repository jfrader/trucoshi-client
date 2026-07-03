import "./PlayButton.css";
import jugarButton from "../../assets/other/trucoshi_jugar.png";
import jugarButtonHover from "../../assets/other/trucoshi_jugar_hover.png";
import { Box, BoxProps } from "@mui/material";

export const PlayButton = ({ ...props }: BoxProps & { disabled?: boolean }) => {
  return (
    <Box
      role="button"
      className={`PlayButton ${props.disabled ? "PlayButton--disabled" : ""}`}
      {...props}
    >
      <img className="PlayButton_default" src={jugarButton}></img>
      <img className="PlayButton_hover" src={jugarButtonHover}></img>
    </Box>
  );
};
