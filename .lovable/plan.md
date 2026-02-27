
# Plano: Pull-to-Refresh, Gráfico por Transação e Layout Sem Espaços Vazios

## 1. Corrigir Gráfico - Seletor de Período

**Problema**: O `SmartChart` chama `useOHLCData` com `"daily"` fixo, o que agrega todas as transações do dia em uma única vela.

**Solução**: 
- Atualizar `SmartChart` para aceitar um prop `timeRange` e passar para `useOHLCData`
- Atualizar `Analytics.tsx` para incluir um seletor de período (Transação, Diário, Semanal, Mensal) usando botões compactos
- Valor padrão: `"individual"` (cada transação = uma vela)

**Arquivos**: `src/components/analytics/SmartChart.tsx`, `src/pages/Analytics.tsx`

## 2. Pull-to-Refresh nas Listas

**Solução**: Criar um componente `PullToRefresh` reutilizável que:
- Detecta gesto de swipe para baixo no topo da lista
- Mostra indicador de loading (spinner)
- Chama callback de refresh e invalida queries

**Arquivos afetados**:
- Novo: `src/components/ui/pull-to-refresh.tsx`
- `src/components/transactions/TransactionsContent.tsx` - envolver lista com PullToRefresh
- `src/pages/InvoicedTransactions.tsx` - envolver lista com PullToRefresh
- `src/components/ExpensesManagement.tsx` - envolver lista com PullToRefresh
- `src/components/RecentTransactions.tsx` - envolver lista com PullToRefresh

## 3. Eliminar Espaços Vazios (Mobile Full-Screen)

**Mudanças**:
- `Analytics.tsx`: O gráfico deve ocupar mais espaço vertical (`h-[calc(100dvh-280px)]` no mobile), remover card de resumo redundante (stats já mostram os dados)
- `Dashboard.tsx`: Reduzir `space-y-3` para `space-y-2`, lista de transações preencher o espaço restante
- `Transactions.tsx`: Reduzir `space-y-3` para `space-y-2`
- `InvoicedTransactions.tsx` e `ExpensesManagement.tsx`: Mesma redução de espaçamento
- `MobileOptimizedLayout.tsx`: Reduzir padding inferior para `pb-16` (nav menor)

## Detalhes Tecnicos

### PullToRefresh Component
```text
+---------------------------+
|   [arrastar para baixo]   |
|        spinner icon       |
+---------------------------+
|                           |
|    Lista de transações    |
|                           |
+---------------------------+
```
- Usa `touchstart`, `touchmove`, `touchend` events
- Threshold de 60px para ativar o refresh
- Só ativa quando scroll está no topo (scrollTop === 0)
- Mostra spinner durante a operação

### Seletor de Período no Gráfico
```text
[Transação] [Diário] [Semanal] [Mensal]
```
- Botões compactos (pills) abaixo do header da página
- "Transação" = `individual` (padrão) - cada transação é uma vela
- Cores: verde para lucro, vermelho para despesa

### Ordem de Implementação

| Etapa | Arquivo | Mudança |
|-------|---------|---------|
| 1 | `src/components/ui/pull-to-refresh.tsx` | Criar componente |
| 2 | `src/components/analytics/SmartChart.tsx` | Adicionar prop timeRange |
| 3 | `src/pages/Analytics.tsx` | Seletor de período + layout full-screen |
| 4 | `src/components/transactions/TransactionsContent.tsx` | Pull-to-refresh |
| 5 | `src/pages/InvoicedTransactions.tsx` | Pull-to-refresh + layout compacto |
| 6 | `src/components/ExpensesManagement.tsx` | Pull-to-refresh + layout compacto |
| 7 | `src/pages/Dashboard.tsx` | Layout sem espaços |
| 8 | `src/components/layout/MobileOptimizedLayout.tsx` | Reduzir padding |
