import { AxiosError, InternalAxiosRequestConfig, isAxiosError } from "axios";
import { Api } from "lightning-accounts";

const config = {
  secure: import.meta.env.MODE === "production",
  withCredentials: true,
  baseURL: import.meta.env.VITE_LIGHTNING_ACCOUNTS_URL,
};

const apiClient = new Api(config);
const SESSION_TIMEOUT_MS = 10_000;
const PROFILE_PATH = "/auth/me";
const REFRESH_PATH = "/auth/refresh-tokens";
let pendingRefresh: ReturnType<typeof apiClient.auth.refreshAuthTokens> | undefined;

apiClient.instance.interceptors.request.use((request) => {
  if (request.url === PROFILE_PATH || request.url === REFRESH_PATH) {
    request.timeout = SESSION_TIMEOUT_MS;
  }
  return request;
});

const is401 = (error: AxiosError | null) => error?.response?.status === 401;

apiClient.instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalReq = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (
      originalReq &&
      !originalReq._retry &&
      is401(error) &&
      originalReq.url !== REFRESH_PATH
    ) {
      originalReq._retry = true;
      if (!pendingRefresh) {
        pendingRefresh = apiClient.auth.refreshAuthTokens().finally(() => {
          pendingRefresh = undefined;
        });
      }
      try {
        await pendingRefresh;
      } catch (refreshError) {
        if (
          isAxiosError(refreshError) &&
          (refreshError.response?.status === 400 || is401(refreshError))
        ) {
          throw error;
        }
        throw refreshError;
      }
      return apiClient.instance(originalReq);
    }

    return Promise.reject(error);
  }
);

export { apiClient, is401 };
