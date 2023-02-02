import { Button, css, keyframes, styled } from "@mui/material";

const bounce = keyframes`
from, 20%, 53%, 80%, to {
  transform: translate3d(0,0,0);
}

40%, 43% {
  transform: translate3d(0, -8px, 0);
}

70% {
  transform: translate3d(0, -5px, 0);
}

90% {
  transform: translate3d(0, -3px, 0);
}
`;

export const AnimatedButton = styled(Button)`
  ${css`
    animation: ${bounce} 1.2s ease infinite;
  `}
`;
