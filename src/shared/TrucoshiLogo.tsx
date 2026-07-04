import { ImgHTMLAttributes } from "react";

export const TrucoshiLogo = (props: ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src="/trucoshi-logo.png" alt="Trucoshi" {...props} />;
};
