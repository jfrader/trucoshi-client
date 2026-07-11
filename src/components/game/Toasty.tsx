import { styled } from "@mui/material";
import { toasty } from "../../assets/animations/toasty";

type Props = { animate: boolean };

const ToastyContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "animate",
})<Props>(({ animate, theme }) => ({
  position: "fixed",
  bottom: "-10px",
  right: "-200px",
  zIndex: theme.zIndex.tooltip + 1,
  animation: animate ? `${toasty} 1.5s ease-in-out` : "none",
  pointerEvents: "none",
}));

const ToastyImage = styled("img")({
  width: "150px",
  height: "auto",
});

const Toasty = ({ animate }: Props) => {
  return (
    <ToastyContainer key={String(animate)} animate={animate}>
      <ToastyImage src="/toasty.png" alt="Toasty!" />
    </ToastyContainer>
  );
};

export default Toasty;
