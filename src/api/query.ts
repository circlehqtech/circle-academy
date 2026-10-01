import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useApiQuery<TData>(
  queryKey: readonly unknown[],
  url: string,
  params?: object,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, Error>({ queryKey, queryFn: () => apiClient.get<TData>(url, params), ...options });
}

export function useApiMutation<TData, TVariables = void>(
  method: "post" | "put" | "patch" | "delete",
  url: string | ((variables: TVariables) => string),
  options?: UseMutationOptions<TData, Error, TVariables>,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => {
      const endpoint = typeof url === "function" ? url(variables) : url;
      if (method === "delete") return apiClient.delete<TData>(endpoint);
      return apiClient[method]<TData>(endpoint, variables);
    },
    ...options,
  });
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return (...keys: readonly unknown[][]) => Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}
