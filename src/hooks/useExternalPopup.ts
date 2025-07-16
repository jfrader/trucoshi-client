import { useEffect, useState } from "react";

export const useExternalPopup = (onPopupClosed?: (data?: any) => void) => {
  const [externalPopup, setExternalPopup] = useState<Window | null>(null);
  const [hasClosed, setClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setError("Popup blocked by browser");
      onPopupClosed?.({ error: "Popup blocked by browser" });
      return;
    }

    setClosed(false);
    setError(null);
    setExternalPopup(popup);
  };

  useEffect(() => {
    if (!externalPopup) {
      return;
    }

    const checkPopupClosed = () => {
      if (externalPopup.closed) {
        setClosed(true);
        setExternalPopup(null);
        onPopupClosed?.();
      }
    };

    const interval = setInterval(checkPopupClosed, 500);

    return () => {
      clearInterval(interval);
    };
  }, [externalPopup, onPopupClosed]);

  return { externalPopup, hasClosed, open, error };
};
