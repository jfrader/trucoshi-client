import { UseQueryOptions, keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError } from "axios";
import type { User } from "lightning-accounts";
import { ApiResponse } from "../types";
export const useMe = (
  options: Omit<UseQueryOptions<ApiResponse<User>, AxiosError>, "queryFn" | "queryKey"> = {},
) => {
  const { data, error, isPending, refetch, isFetching } = useQuery<ApiResponse<User>, AxiosError>({
    queryKey: ["me"],
    retry: false,
    queryFn: apiClient.auth.getUserProfile,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    ...options,
  });

  return { me: data?.data, error, isPending, refetch, isFetching };
};
