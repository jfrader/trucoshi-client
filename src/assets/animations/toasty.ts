import { keyframes } from "@mui/material";

export const toasty = keyframes`
  0% {
    right: -200px;
    opacity: 0;
  }
  10% {
    right: 0px;
    opacity: 1;
  }
  90% {
    right: 0px;
    opacity: 1;
  }
  100% {
    right: -200px;
    opacity: 0;
  }
`;
