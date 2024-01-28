import { useEffect, useState } from "react";

export const useExternalPopup = (onPopupClosed?: () => void) => {
  const [externalPopup, setExternalPopup] = useState<Window | null>(null);
  const [hasClosed, setClosed] = useState(false);

  const open = ({
    url,
    title,
    width = 600,
    height = 800,
  }: {
    url: string;
    title: string;
    width?: number;
    height?: number;
  }) => {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const popup = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (popup) {
      setClosed(false);
      setExternalPopup(popup);
    }
  };

  useEffect(() => {
    if (!externalPopup) {
      return;
    }

    if (externalPopup.closed) {
      setClosed((current) => {
        if (current) {
          return current;
        }

        onPopupClosed?.();
        return true;
      });
    }
  }, [externalPopup, onPopupClosed]);

  return { externalPopup, hasClosed, open };
};
