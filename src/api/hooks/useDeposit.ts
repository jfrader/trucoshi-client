import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../apiClient";
import { UseQueryOptions, keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse, AxiosError } from "axios";
import { Transaction } from "lightning-accounts";

export const useDeposit = ({
  transactionId,
  ...options
}: {
  transactionId: string;
} & Omit<UseQueryOptions<AxiosResponse<Transaction>, AxiosError>, "queryFn" | "queryKey">) => {
  const [enabled, setEnabled] = useState(false);

  const queryClient = useQueryClient();

  const { data, error, isPending } = useQuery<AxiosResponse<Transaction>, AxiosError>({
    queryKey: ["wallet-get-deposit"],
    queryFn: () => apiClient.wallet.depositDetail(transactionId),
    retry: false,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    placeholderData: () => undefined,
    enabled,
    ...options,
  });

  const enable = useCallback(() => {
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
  }, []);

  useEffect(() => {
    if (error) {
      disable();
    }
    if (data?.data.walletImpacted) {
      disable();
      queryClient.resetQueries({ queryKey: ["me"] });
      return;
    }
  }, [data?.data.walletImpacted, error, disable, queryClient]);

  return { deposit: data?.data, disable, enable, error, isPending };
};
