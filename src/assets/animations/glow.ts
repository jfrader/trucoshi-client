import { keyframes } from "@mui/material";

export const glow = keyframes`
  from {
    box-shadow: 0 0 10px -10px rgb(155, 255, 155, 0.2);
  }
  to {
    box-shadow: 0 0 10px 10px rgb(155, 255, 155, 0.1);
  }
`;

export const fade = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;
