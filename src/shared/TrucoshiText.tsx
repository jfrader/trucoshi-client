import { CSSProperties, HTMLAttributes } from "react";

type TrucoshiTextProps = HTMLAttributes<HTMLSpanElement> & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

export const TrucoshiText = ({ width, height, style, ...props }: TrucoshiTextProps) => (
  <span
    {...props}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width,
      minHeight: height,
      color: "currentColor",
      fontFamily: "system-ui, sans-serif",
      fontSize: height === "26px" ? "1.25rem" : "clamp(2.5rem, 9vw, 6rem)",
      fontWeight: 900,
      letterSpacing: "0.08em",
      lineHeight: 1,
      textTransform: "uppercase",
      ...style,
    }}
  >
    Trucoshi
  </span>
);
