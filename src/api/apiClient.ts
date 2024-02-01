import { AxiosError } from "axios";
import { Api } from "lightning-accounts";

const config = {
  secure: import.meta.env.MODE === "production",
  withCredentials: true,
  baseURL: import.meta.env.VITE_LIGHTNING_ACCOUNTS_URL,
};

const apiClient = new Api(config);

const is401 = (error: AxiosError | null) => error?.response?.status === 401;

apiClient.instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const parsedError =
      error && "response" in error && error.response?.data ? error.response.data : error;
    const originalReq = error.config;
    if (
      !originalReq._retry &&
      is401(error) &&
      !new RegExp((originalReq as Request).url).test("refresh-token")
    ) {
      originalReq._retry = true;
      return apiClient.auth
        .refreshTokensCreate()
        .then(() => apiClient.instance(originalReq))
        .catch(() => {
          throw parsedError;
        });
    }

    return Promise.reject(parsedError);
  }
);

export { apiClient, is401 };
