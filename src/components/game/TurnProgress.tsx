import { LinearProgress } from "@mui/material";
import { TurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { useEffect, useState } from "react";

type Props = {
  turnTimer: TurnTimer;
  visible?: boolean;
};

export const TurnProgress = ({ turnTimer, visible }: Props) => {
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    setAlert(true);
    const timer = setTimeout(() => {
      setAlert(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [turnTimer.alert]);

  return (
    <LinearProgress
      sx={{ visibility: visible ? "visible" : "hidden" }}
      variant="determinate"
      color={alert ? "warning" : turnTimer.isExtension ? "error" : "success"}
      value={visible ? turnTimer.progress : 100}
    />
  );
};
