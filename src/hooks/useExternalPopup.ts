import { useEffect, useState, useCallback } from "react";

export const useExternalPopup = (onPopupClosed?: () => void, onSuccess?: () => void) => {
  const [externalPopup, setExternalPopup] = useState<Window | null>(null);
  const [hasClosed, setClosed] = useState(false);

  const open = useCallback(
    ({
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

      if (popup) {
        setClosed(false);
        setExternalPopup(popup);
      }
    },
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (externalPopup && externalPopup.closed) {
        setClosed((current) => {
          if (!current) {
            onPopupClosed?.();
          }
          return true;
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [externalPopup, onPopupClosed]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from popup:", event.data);
      if (event.data?.type === "twitter-auth-success") {
        onSuccess?.();
        externalPopup?.close(); // just in case
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [externalPopup, onSuccess]);

  return { externalPopup, hasClosed, open };
};
