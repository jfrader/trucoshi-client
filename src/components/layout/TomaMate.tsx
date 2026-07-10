import { IconButton, Slide, styled } from "@mui/material";
import MateIcon from "../../assets/icons/MateIcon";
import { useSound } from "../../sound/hooks/useSound";
import { shakeSmall } from "../../assets/animations/rain";
import { useState } from "react";
import { RainDrop } from "../../shared/EmojiRain";
import bigMate from "../../assets/other/big_mate.png";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useMatchRoute } from "@tanstack/react-router";
import { EClientEvent } from "trucoshi";

const bellySize = 21;

export const TomaMate = () => {
  const { queue } = useSound();
  const [, , socket] = useTrucoshi();
  const [shake, setShake] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [belly, setBelly] = useState(0);

  const matchRoute = useMatchRoute();
  const match = matchRoute({ to: "/match/$sessionId" });
  const lobby = matchRoute({ to: "/lobby/$sessionId" });

  return (
    <>
      <AnimatedButton
        shake={shake}
        size="small"
        color={shake ? "success" : "default"}
        title="Toma mate"
        disabled={disabled}
        onClick={() => {
          if (shake) {
            return;
          }

          const sound = Math.random() > 0.5 ? "ceba_toma_mate" : "mate";
          const ml = match || lobby;
          if (ml) {
            setDisabled(true);
            socket.emit(EClientEvent.SAY, ml.sessionId, sound);
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
              setBelly((c) => Math.min(c + 1, bellySize));
            }
          });
        }}
      >
        <MateIcon fontSize="small" />
      </AnimatedButton>
      <Slide in={belly === bellySize} mountOnEnter unmountOnExit>
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

const AnimatedButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "shake",
})<{ shake?: boolean }>(({ shake }) => ({
  animation: `${shakeSmall} 0.6s ease infinite`,
  animationPlayState: shake ? "running" : "paused",
}));
