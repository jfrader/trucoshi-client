export const PENDING_REWARD_CODE_KEY = "trucoshi:pendingRewardCode";
export const PROMO_CHEST_READY_KEY = "trucoshi:promoChestReady";

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const hasPendingRewardCode = () =>
  canUseStorage() && Boolean(window.localStorage.getItem(PENDING_REWARD_CODE_KEY));

export const markPromoChestReady = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PROMO_CHEST_READY_KEY, "true");
};

export const hasPromoChestReady = () =>
  canUseStorage() && window.localStorage.getItem(PROMO_CHEST_READY_KEY) === "true";

export const clearPromoChestReady = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PROMO_CHEST_READY_KEY);
};
