import { keyframes } from "@mui/material";

export const glow = keyframes`
  from {
    box-shadow: 0 0 10px -10px rgb(255, 255, 255, 0.1);
  }
  to {
    box-shadow: 0 0 10px 10px rgb(255, 255, 255, 0.1);
  }
`;
