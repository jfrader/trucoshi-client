import { CheckCircleOutline, X } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { useState } from "react";
import type { User } from "lightning-accounts";
import { TwitterButton } from "../../shared/TwitterButton";
import {
  AccountPanel,
  AccountPanelHeader,
  AccountSettingRow,
  AccountSettingsList,
} from "./accountUi";
import { EmailSettings } from "./EmailSettings";
import { PasswordSettings } from "./PasswordSettings";
import { SeedPhraseSettings } from "./SeedPhraseSettings";

export const AccountSecuritySection = ({ account }: { account: User }) => {
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <AccountPanel data-testid="account-security-section">
      <AccountPanelHeader
        title="Acceso y seguridad"
        description="Administrá cada método por separado. Los cambios sensibles se confirman en un paso dedicado."
      />
      <AccountSettingsList>
        <EmailSettings
          account={account}
          open={emailOpen}
          onClose={() => setEmailOpen(false)}
          onOpen={() => setEmailOpen(true)}
          onRequestPassword={() => setPasswordOpen(true)}
        />
        <PasswordSettings
          account={account}
          open={passwordOpen}
          onClose={() => setPasswordOpen(false)}
          onOpen={() => setPasswordOpen(true)}
        />
        <SeedPhraseSettings account={account} />
        <AccountSettingRow
          icon={<X />}
          title="Cuenta de X"
          description={
            account.twitter
              ? `Conectada como @${account.twitter.replace(/^@/, "")}`
              : "Conectá X como método adicional de acceso y avatar."
          }
          action={
            account.twitter ? (
              <Chip
                color="success"
                size="small"
                icon={<CheckCircleOutline />}
                label="Conectada"
                variant="outlined"
              />
            ) : (
              <TwitterButton size="small">Conectar</TwitterButton>
            )
          }
          testId="account-twitter-setting"
        />
      </AccountSettingsList>
    </AccountPanel>
  );
};
