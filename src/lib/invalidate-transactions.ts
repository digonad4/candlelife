import { QueryClient } from "@tanstack/react-query";

/**
 * Invalida todas as queries relacionadas a transações
 * Deve ser chamado após qualquer operação CRUD em transações
 */
export function invalidateAllTransactionQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["ohlc-data"] });
  queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
  queryClient.invalidateQueries({ queryKey: ["financial-insights"] });
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["invoiced-transactions"] });
}
