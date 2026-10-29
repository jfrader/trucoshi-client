import { UseQueryOptions, keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";
import { User } from "lightning-accounts";
import { useCookies } from "react-cookie";
import { getCookieName } from "../../utils/cookie";
export const useMe = (
  options: Omit<UseQueryOptions<AxiosResponse<User>, AxiosError>, "queryFn" | "queryKey"> = {}
) => {
  const identityCookie = getCookieName("identity");
  const [cookies] = useCookies([identityCookie]);
  const hasIdentity = Boolean(cookies[identityCookie]);
  const { data, error, isPending, refetch, isFetching } = useQuery<AxiosResponse<User>, AxiosError>(
    {
      queryKey: ["me"],
      retry: false,
      queryFn: apiClient.auth.getUserProfile,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: true,
      ...options,
      enabled: hasIdentity && (options.enabled ?? true),
    }
  );

  return { me: data?.data, error, isPending, refetch, isFetching, hasIdentity };
};
