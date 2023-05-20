import { Button, css, styled } from "@mui/material";
import { bounce } from "../assets/animations/bounce";

export const AnimatedButton = styled(Button)`
  ${css`
    animation: ${bounce} 1.2s ease infinite;
    animation-delay: 0.8s;
  `}
`;
