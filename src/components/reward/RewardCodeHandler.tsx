import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { GAME_ERROR } from "trucoshi";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { markPromoChestReady, PENDING_REWARD_CODE_KEY } from "./rewardCodeStorage";

export const RewardCodeHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [{ account, isConnected }, { redeemRewardCode }] = useTrucoshi();
  const [redeemingCode, setRedeemingCode] = useState<string | null>(null);
  const [attemptedCode, setAttemptedCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.searchStr);
    const code = params.get("code")?.trim();

    if (!code) {
      return;
    }

    window.localStorage.setItem(PENDING_REWARD_CODE_KEY, code);
    if (!account?.id) {
      void navigate({ to: "/login", replace: true });
      return;
    }

    void navigate({ to: "/", replace: true });
  }, [account?.id, location.searchStr, navigate]);

  useEffect(() => {
    if (!account?.id || !isConnected || redeemingCode) {
      return;
    }

    const code = window.localStorage.getItem(PENDING_REWARD_CODE_KEY);

    if (!code || attemptedCode === code) {
      return;
    }

    setRedeemingCode(code);
    setAttemptedCode(code);

    redeemRewardCode(code, { silent: true }).then((result) => {
      if (result.success) {
        markPromoChestReady();
      }

      if (
        result.success ||
        result.errorCode === GAME_ERROR.REWARD_CODE_INVALID ||
        result.errorCode === GAME_ERROR.REWARD_CODE_REDEEMED
      ) {
        window.localStorage.removeItem(PENDING_REWARD_CODE_KEY);
      }

      setRedeemingCode(null);
    });
  }, [account?.id, attemptedCode, isConnected, redeemingCode, redeemRewardCode]);

  return null;
};

export { PENDING_REWARD_CODE_KEY };
