import { css, styled } from "@mui/material";
import { bounce } from "../assets/animations/bounce";
import { LoadingButton } from "./LoadingButton";

export const AnimatedButton = styled(LoadingButton)`
  ${css`
    animation: ${bounce} 1.2s ease infinite;
    animation-delay: 0.8s;
  `}
`;
