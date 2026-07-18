export type PublicAdmissionStatus = {
  admission: "accepting" | "draining";
  acceptingNewGames: boolean;
  available: boolean;
  version: string | null;
};

export type AdmissionProxyConfig = {
  serverUrl?: string;
  statusToken?: string;
};

export type AdmissionStatusReader = (
  config?: AdmissionProxyConfig,
) => Promise<PublicAdmissionStatus>;

export const UNAVAILABLE_ADMISSION_STATUS: Readonly<PublicAdmissionStatus>;
export const sanitizeAdmissionStatus: (value: unknown) => PublicAdmissionStatus;
export const createAdmissionStatusReader: (options?: {
  cacheTtlMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => number;
  requestTimeoutMs?: number;
}) => AdmissionStatusReader;
export const writeAdmissionResponse: (
  response: {
    writeHead(status: number, headers: Record<string, string | number>): void;
    end(body?: string): void;
  },
  status: unknown,
  method?: string,
) => void;
