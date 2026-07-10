import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../apiClient";
import { UseQueryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { Transaction } from "lightning-accounts";
import { ApiResponse } from "../types";

export const useDeposit = ({
  transactionId,
  ...options
}: {
  transactionId: string;
} & Omit<UseQueryOptions<ApiResponse<Transaction>, AxiosError>, "queryFn" | "queryKey">) => {
  const [enabled, setEnabled] = useState(false);

  const queryClient = useQueryClient();

  const { data, error, isPending } = useQuery<ApiResponse<Transaction>, AxiosError>({
    queryKey: ["wallet-get-deposit"],
    queryFn: () => apiClient.wallet.getDepositTransaction(transactionId),
    retry: false,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    enabled,
    ...options,
  });

  const enable = useCallback(() => {
    queryClient.resetQueries({ queryKey: ["wallet-get-deposit"] });
    setEnabled(true);
  }, [queryClient]);

  const disable = useCallback(() => {
    setEnabled(false);
  }, []);

  useEffect(() => {
    if (error) {
      disable();
    }
    if (data?.data.walletImpacted) {
      disable();
      queryClient.refetchQueries({ queryKey: ["me"] });
      return;
    }
  }, [data?.data.walletImpacted, error, disable, queryClient]);

  return { deposit: data?.data, disable, enable, error, isPending };
};
