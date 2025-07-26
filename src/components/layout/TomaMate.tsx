import { IconButton, Slide, styled } from "@mui/material";
import MateIcon from "../../assets/icons/MateIcon";
import { useSound } from "../../sound/hooks/useSound";
import { shakeSmall } from "../../assets/animations/rain";
import { useState } from "react";
import { RainDrop } from "../../shared/EmojiRain";
import bigMate from "../../assets/other/big_mate.png";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useMatch } from "react-router-dom";
import { EClientEvent } from "trucoshi";

const bellySize = 21;

export const TomaMate = () => {
  const { queue } = useSound();
  const [{ cardTheme }, { setCardTheme }, socket] = useTrucoshi();
  const [shake, setShake] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [belly, setBelly] = useState(0);
  const isArgento = cardTheme === "argento";

  const match = useMatch("/match/:sessionId");
  const lobby = useMatch("/lobby/:sessionId");

  return (
    <>
      <AnimatedButton
        shake={shake}
        size="small"
        color={isArgento ? "primary" : shake ? "success" : "default"}
        title={isArgento ? "Cartas argentas activadas" : "Toma mate"}
        disabled={disabled}
        onClick={() => {
          if (isArgento || shake) {
            return;
          }

          const sound = Math.random() > 0.5 ? "ceba_toma_mate" : "mate";
          const ml = match || lobby;
          if (ml && ml.params.sessionId) {
            setDisabled(true);
            socket.emit(EClientEvent.SAY, ml.params.sessionId, sound);
            setTimeout(() => {
              setDisabled(false);
            }, 4000);
          }

          queue(sound, (_e, status) => {
            if (status === "playing") {
              setShake(true);
            }
            if (status === "finished") {
              setShake(false);
              setBelly((c) => {
                if (c >= bellySize - 1) {
                  setCardTheme("argento");
                }
                return c + 1;
              });
            }
          });
        }}
      >
        <MateIcon fontSize="small" />
      </AnimatedButton>
      <Slide in={belly === bellySize}>
        <RainDrop
          sx={{
            pointerEvents: "none",
            position: "absolute",
            "& img": {
              pointerEvents: "all",
              cursor: "pointer",
              marginTop: "15vh",
              objectFit: "contain",
              width: "50vw",
              height: "50vh",
            },
          }}
        >
          <img
            onClick={() => {
              setBelly((c) => c + 1);
            }}
            src={bigMate}
          />
        </RainDrop>
      </Slide>
    </>
  );
};

const AnimatedButton = styled(IconButton)<{ shake?: boolean }>(({ shake }) => ({
  animation: `${shakeSmall} 0.6s ease infinite`,
  animationPlayState: shake ? "running" : "paused",
}));
