import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";
import { User } from "lightning-accounts";
export const useMe = (
  options: Omit<UseQueryOptions<AxiosResponse<User>, AxiosError>, "queryFn" | "queryKey"> = {}
) => {
  const { data, error, isPending, refetch } = useQuery<AxiosResponse<User>, AxiosError>({
    queryKey: ["me"],
    retry: false,
    queryFn: apiClient.auth.getAuth,
    ...options,
  });

  return { me: data?.data, error, isPending, refetch };
};
