import { AxiosError } from "axios";
import { Api } from "lightning-accounts";

const config = {
  secure: import.meta.env.MODE === "production",
  withCredentials: true,
  baseURL: import.meta.env.LIGHTNING_ACCOUNTS_URL,
};

const apiClient = new Api(config);

const is401 = (error: AxiosError | null) => error?.response?.status === 401;

apiClient.instance.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log({ error });
    const originalReq = error.config;
    if (!originalReq._retry && is401(error)) {
      originalReq._retry = true;
      return apiClient.auth.refreshTokensCreate().then(() => apiClient.instance(originalReq));
    }
    return Promise.reject(error);
  }
);

export { apiClient, is401 };
