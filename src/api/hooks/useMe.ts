import { UseQueryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";
import { User } from "lightning-accounts";
export const useMe = (
  options: Omit<UseQueryOptions<AxiosResponse<User>, AxiosError>, "queryFn" | "queryKey"> = {}
) => {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch, isFetching } = useQuery<AxiosResponse<User>, AxiosError>(
    {
      queryKey: ["me"],
      retry: false,
      queryFn: apiClient.auth.getAuth,
      ...options,
    }
  );

  const reset = () => queryClient.resetQueries({ queryKey: ["me"] });

  return { me: data?.data, error, isPending, refetch, reset, isFetching };
};
