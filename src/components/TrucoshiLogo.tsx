import { ImgHTMLAttributes } from "react";

export const TrucoshiLogo = (props: ImgHTMLAttributes<HTMLImageElement>) => {
  return <img src="/svg-logo-icon.svg" alt="Trucoshi" {...props} />;
};
