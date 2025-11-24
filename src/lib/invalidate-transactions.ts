import { QueryClient } from "@tanstack/react-query";

/**
 * Invalida todas as queries relacionadas a transações
 * Deve ser chamado após qualquer operação CRUD em transações
 */
export function invalidateAllTransactionQueries(queryClient: QueryClient) {
  // Invalidar todas as queries relacionadas
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["ohlc-data"] });
  queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
  queryClient.invalidateQueries({ queryKey: ["financial-insights"] });
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["invoiced-transactions"] });
  
  // Forçar recarregamento imediato dos dados OHLC
  queryClient.refetchQueries({ queryKey: ["ohlc-data"] });
  
  // Limpar cache de refresh para forçar recálculo
  sessionStorage.removeItem('ohlc-last-refresh');
}
