import { IconButton, Slide, styled } from "@mui/material";
import MateIcon from "../../assets/icons/MateIcon";
import { useSound } from "../../sound/hooks/useSound";
import { shakeSmall } from "../../assets/animations/rain";
import { useState } from "react";
import { RainDrop } from "../../shared/EmojiRain";
import bigMate from "../../assets/other/big_mate.png";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

const bellySize = 21;

export const TomaMate = () => {
  const { queue } = useSound();
  const [{ cardTheme }, { setCardTheme }] = useTrucoshi();
  const [shake, setShake] = useState(false);
  const [belly, setBelly] = useState(0);
  const isArgento = cardTheme === "argento";

  return (
    <>
      <AnimatedButton
        shake={shake}
        size="small"
        color={isArgento ? "primary" : shake ? "success" : "default"}
        title={isArgento ? "Cartas argentas activadas" : "Toma mate"}
        onClick={() => {
          if (isArgento || shake) {
            return;
          }
          queue(Math.random() > 0.5 ? "ceba_toma_mate" : "mate", (_e, status) => {
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
