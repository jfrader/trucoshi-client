import { AxiosError } from "axios";
import { Api } from "lightning-accounts";

const apiClient = new Api({ secure: import.meta.env.MODE === "production", withCredentials: true, baseURL: import.meta.env.LIGHTNING_ACCOUNTS_URL });

const is401 = (error: AxiosError | null) => error?.response?.status === 401;

export { apiClient, is401 };
