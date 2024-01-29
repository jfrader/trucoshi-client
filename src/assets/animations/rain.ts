import { keyframes } from "@emotion/react";

export const fall = keyframes`
  0% {
    top: -10%;
  }
  100% {
    top: 100%;
  }
`;

export const shake = keyframes`
  0% {
    transform: translateX(0px);
  }
  25% {
    transform: translateX(15px);
  }
  50% {
    transform: translateX(-15px);
  }
  100% {
    transform: translateX(0px);
  }
`;
