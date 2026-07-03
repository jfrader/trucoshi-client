import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useConfirmationModal } from "./useConfirmationModal";

const VERSION_CHECK_TIME = 1000 * 5 * 60;
const SERVER_VERSION_PATH = "/version.json";
const TITLE = "Hay una nueva version disponible";

// eslint-disable-next-line react-refresh/only-export-components
const DEFAULT_ON_RELOAD = () => {
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

export const useVersionReload = ({
  currentVersion,
  disabled,
  serverVersionPath = SERVER_VERSION_PATH,
  onReload = DEFAULT_ON_RELOAD,
  title = TITLE,
}: {
  currentVersion: string;
  disabled?: boolean;
  title?: string;
  serverVersionPath?: string;
  onReload?: () => void;
}) => {
  const modal = useConfirmationModal();

  const versionCheck = useQuery({
    queryKey: ["app-version-check"],
    queryFn: async () => {
      const res = await fetch(serverVersionPath);
      return res.json();
    },
    enabled: !disabled,
    refetchInterval: VERSION_CHECK_TIME,
    gcTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (versionCheck.data && versionCheck.data.version.trim() !== currentVersion) {
      modal.onOpen({
        onConfirm: onReload,
        acceptLabel: "Recargar",
        title,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionCheck.dataUpdatedAt]);

  return { modal, refetch: versionCheck.refetch, onReload };
};
