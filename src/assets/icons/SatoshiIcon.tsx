import { SvgIcon, SvgIconProps } from "@mui/material";

export const SatoshiIcon = (props: SvgIconProps) => (
  <SvgIcon sx={{ transform: "rotate(12deg)", top: 2, position: 'relative' }} {...props}>
    <path d="M12.75 18.5V21h-1.5v-2.5zM17 16.75H7v-1.5h10zm0-4H7v-1.5h10zm0-4H7v-1.5h10zM12.75 3v2.5h-1.5V3z" />
  </SvgIcon>
);
