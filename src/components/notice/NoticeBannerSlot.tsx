import { useEffect, useMemo, useState } from "react";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { NoticeBanner, NoticeBannerProps } from "./NoticeBanner";
import { hasPendingRewardCode } from "../reward/rewardCodeStorage";

export const NOTICE_BANNER_DISMISSED_KEY = "trucoshi:noticeBannerDismissed";
export const TREASURE_BANNER_DISMISSED_KEY = "trucoshi:treasureBannerDismissed";
const TREASURE_BANNER_DISMISSAL_TTL_MS = 24 * 60 * 60 * 1000;
type TreasureBannerType = "guest" | "treasure";
type TreasureBannerDismissal = {
  type: TreasureBannerType;
  dismissedAt: number;
};

export const getNoticeBannerDismissalValue = (id: number, updatedAt: string) =>
  `${id}:${updatedAt}`;

const getStoredDismissalValue = () =>
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem(NOTICE_BANNER_DISMISSED_KEY)
    : null;

const setStoredDismissalValue = (value: string) => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(NOTICE_BANNER_DISMISSED_KEY, value);
  }
};

const getStoredTreasureBannerDismissal = (): TreasureBannerDismissal | null => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  const storedValue = window.localStorage.getItem(TREASURE_BANNER_DISMISSED_KEY);
  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<TreasureBannerDismissal>;
    if (
      (parsedValue.type === "guest" || parsedValue.type === "treasure") &&
      typeof parsedValue.dismissedAt === "number"
    ) {
      return parsedValue as TreasureBannerDismissal;
    }
  } catch {
    return null;
  }

  return null;
};

const setStoredTreasureBannerDismissal = (type: TreasureBannerType) => {
  const dismissal: TreasureBannerDismissal = {
    type,
    dismissedAt: Date.now(),
  };

  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(TREASURE_BANNER_DISMISSED_KEY, JSON.stringify(dismissal));
  }

  return dismissal;
};

const isTreasureBannerDismissed = (
  dismissal: TreasureBannerDismissal | null,
  type: TreasureBannerType,
) =>
  Boolean(
    dismissal &&
    dismissal.type === type &&
    Date.now() - dismissal.dismissedAt < TREASURE_BANNER_DISMISSAL_TTL_MS,
  );

export const NoticeBannerSlot = ({
  dismissible = true,
  ignoreDismissal = false,
}: {
  dismissible?: boolean;
  ignoreDismissal?: boolean;
}) => {
  const [{ noticeBanner }] = useTrucoshi();
  const dismissalValue = useMemo(
    () =>
      noticeBanner ? getNoticeBannerDismissalValue(noticeBanner.id, noticeBanner.updatedAt) : "",
    [noticeBanner],
  );
  const [dismissedValue, setDismissedValue] = useState<string | null>(null);

  useEffect(() => {
    setDismissedValue(getStoredDismissalValue());
  }, [dismissalValue]);

  if (!noticeBanner) {
    return null;
  }

  const dismissed = !ignoreDismissal && dismissedValue === dismissalValue;

  return (
    <NoticeBanner
      {...noticeBanner}
      dismissible={dismissible}
      hidden={dismissed}
      onClose={() => {
        setStoredDismissalValue(dismissalValue);
        setDismissedValue(dismissalValue);
      }}
    />
  );
};

export const TreasureBannerSlot = () => {
  const [{ account }] = useTrucoshi();
  const [showRewardCodeAlert, setShowRewardCodeAlert] = useState(false);
  const bannerType: TreasureBannerType = showRewardCodeAlert ? "treasure" : "guest";
  const [dismissal, setDismissal] = useState<TreasureBannerDismissal | null>(null);
  const hidden = isTreasureBannerDismissed(dismissal, bannerType);

  useEffect(() => {
    setShowRewardCodeAlert(!account && hasPendingRewardCode());
    setDismissal(getStoredTreasureBannerDismissal());
  }, [account]);

  const banner: NoticeBannerProps = {
    hidden,
    buttonHref: "/login",
    buttonText: "Login / Registro en 1 click",
    severity: "info",
    dismissible: true,
  };

  const treasureBanner: NoticeBannerProps = {
    text: "Recibiste un cofre! Inicia sesion o registrate para reclamarlo!",
    ...banner,
  };

  const guestBanner: NoticeBannerProps = {
    text: "Estas jugando como invitado, crea una cuenta para ganar cartas nuevas y subir en el ranking!",
    ...banner,
  };

  if (account) {
    return null;
  }

  return (
    <NoticeBanner
      {...(showRewardCodeAlert ? treasureBanner : guestBanner)}
      onClose={() => {
        setDismissal(setStoredTreasureBannerDismissal(bannerType));
      }}
    />
  );
};
