import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../api/hooks/useMe";
import { AccountActivitySection } from "../components/account/AccountActivitySection";
import { AccountHero } from "../components/account/AccountHero";
import { AccountIdentitySection } from "../components/account/AccountIdentitySection";
import { AccountSecuritySection } from "../components/account/AccountSecuritySection";
import { AccountWalletSection } from "../components/account/AccountWalletSection";
import {
  AccountColumns,
  AccountContentLoading,
  AccountPageRoot,
} from "../components/account/accountUi";
import { usePlayerProfile } from "../components/profile/usePlayerProfile";
import { PageContainer } from "../shared/PageContainer";

const depositsEnabled = import.meta.env.VITE_ENABLE_BETS_AND_DEPOSITS === "1";

export const Account = () => {
  const navigate = useNavigate();
  const { me, isPending } = useMe();
  const accountId = me?.id;
  const { profile, isLoading: profileLoading } = usePlayerProfile(accountId);

  useEffect(() => {
    if (!isPending && !me) {
      navigate("/login", { replace: true });
    }
  }, [isPending, me, navigate]);

  if (isPending || !me || !accountId) {
    return (
      <PageContainer maxWidth="lg">
        <AccountContentLoading />
      </PageContainer>
    );
  }

  const showWallet = Boolean(
    me.wallet && (depositsEnabled || me.wallet.balanceInSats > 0),
  );

  return (
    <PageContainer maxWidth="lg">
      <AccountPageRoot data-testid="account-page">
        <AccountHero account={me} profile={profile} profileLoading={profileLoading} />
        <AccountColumns>
          <Stack gap={2.25}>
            <AccountIdentitySection account={me} />
            {showWallet && me.wallet ? <AccountWalletSection wallet={me.wallet} /> : null}
            <AccountActivitySection loading={profileLoading} profile={profile} />
          </Stack>
          <AccountSecuritySection account={me} />
        </AccountColumns>
      </AccountPageRoot>
    </PageContainer>
  );
};
