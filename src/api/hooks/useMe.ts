import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { AxiosError, AxiosResponse } from "axios";
import { Me } from "lightning-accounts";
export const useMe = (
  options: Omit<UseQueryOptions<AxiosResponse<Me>, AxiosError>, "queryFn" | "queryKey"> = {},
) => {
  const { data, error, isPending } = useQuery<AxiosResponse<Me>, AxiosError>({
    queryKey: ["me"],
    retry: false,
    queryFn: apiClient.auth.getAuth,
    ...options,
  });

  return { me: data, error, isPending };
};
