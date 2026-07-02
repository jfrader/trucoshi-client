import { useEffect, useMemo, useState } from "react";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { NoticeBanner } from "./NoticeBanner";

export const NOTICE_BANNER_DISMISSED_KEY = "trucoshi:noticeBannerDismissed";

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
      noticeBanner
        ? getNoticeBannerDismissalValue(noticeBanner.id, noticeBanner.updatedAt)
        : "",
    [noticeBanner]
  );
  const [dismissedValue, setDismissedValue] = useState(() =>
    getStoredDismissalValue()
  );

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
