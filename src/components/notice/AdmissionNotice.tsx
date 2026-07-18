import { Alert, Button } from "@mui/material";
import {
  ADMISSION_MAINTENANCE_DETAIL,
  ADMISSION_MAINTENANCE_MESSAGE,
} from "../../trucoshi/admission";
import { useGameAdmission } from "../../trucoshi/hooks/useGameAdmission";

export const AdmissionNotice = ({ compact = false }: { compact?: boolean }) => {
  const { isDraining, retryAdmission } = useGameAdmission();

  if (!isDraining) {
    return null;
  }

  return (
    <Alert
      action={
        <Button color="inherit" onClick={() => void retryAdmission()} size="small">
          Reintentar
        </Button>
      }
      data-testid="admission-maintenance-notice"
      severity="warning"
      variant="outlined"
    >
      {ADMISSION_MAINTENANCE_MESSAGE}
      {compact ? null : ` — ${ADMISSION_MAINTENANCE_DETAIL}`}
    </Alert>
  );
};
