import { keyframes } from "@mui/material";

export const bounce = keyframes`
from, 20%, 53%, 80%, to {
  transform: translate3d(0,0,0);
}

40%, 43% {
  transform: translate3d(0, -7px, 0);
}

70% {
  transform: translate3d(0, -5px, 0);
}

90% {
  transform: translate3d(0, -3px, 0);
}
`;
