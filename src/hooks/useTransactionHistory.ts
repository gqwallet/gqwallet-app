/**
 * Loads the unified ledger and server calculated movement totals.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { useResource } from '@/hooks/useResource';
import { transactionsService } from '@/services/transactions.service';
import type { HistoryDay, HistoryTotal } from '@/types/history';
import type { Currency } from '@/types/api';
import type { TransactionFilter, TransactionNature } from '@/types/transaction';
import { categoryIcon } from '@/utils/categoryIcons';

/**
 * Loads history pages without merging or reordering source tables in the browser.
 *
 * @param filter - Server side history filters.
 * @param monthLabel - Month name for total labels.
 * @returns Day groups, totals and incremental loading actions.
 * @example
 * ```ts
 * const history = useTransactionHistory({ currency: 'PEN' }, null);
 * ```
 */
export function useTransactionHistory(filter: TransactionFilter, monthLabel: string | null) {
  const key = JSON.stringify(filter);
  const list = useInfiniteList((page, signal) => transactionsService.listLedger({ ...filter, page, size: 20 }, signal), key);
  const totals = useResource(async (signal) => {
    const currencies: Currency[] = filter.currency ? [filter.currency] : ['PEN', 'USD'];
    const natures: TransactionNature[] = filter.nature ? [filter.nature] : ['INCOME', 'EXPENSE'];
    return Promise.all(currencies.flatMap((currency) => natures.map(async (nature): Promise<HistoryTotal> => {
      const result = await transactionsService.list({ ...filter, currency, nature, status: filter.status ?? 'ACTIVE', page: 0, size: 1 }, signal);
      const label = nature === 'INCOME' ? 'Ingresos' : 'Gastos';
      return { label: monthLabel ? `${label} de ${monthLabel} · ${currency}` : `${label} ${currency}`, currency, isIncome: nature === 'INCOME', count: result.totalElements,
        total: result.totals.find((entry) => entry.currency === currency && entry.nature === nature)?.total ?? 0 };
    })));
  }, [key, monthLabel]);
  const days: HistoryDay[] = [];
  list.items.forEach((entry) => {
    const item = { id: entry.id, type: entry.entryType === 'MOVEMENT' ? 'transaction' as const : 'transfer' as const,
      date: entry.economicDate, title: entry.title, detail: (entry.entryType === 'TRANSFER' ? [entry.paymentMethod.label, entry.description] : [entry.merchant ?? entry.description, entry.paymentMethod.label]).filter(Boolean).join(' · '),
      icon: entry.entryType === 'MOVEMENT' ? categoryIcon(entry.title) : 'swap_horiz', amount: entry.amount, currency: entry.currency,
      isIncome: entry.nature === 'INCOME', isVoided: entry.status === 'VOIDED', badge: entry.status === 'VOIDED' ? 'Anulado' : entry.entryType === 'TRANSFER' ? 'Transferencia' : null };
    const last = days.at(-1);
    if (last?.date === item.date) last.items.push(item); else days.push({ date: item.date, items: [item] });
  });
  const { reset } = list;
  const { refetch: refreshTotals } = totals;
  const refetch = useCallback(() => { reset(); refreshTotals(); }, [reset, refreshTotals]);
  return { data: list.isLoading ? null : { days, totals: totals.data ?? [], hasMore: list.hasMore }, isLoading: list.isLoading,
    error: list.error ?? totals.error, refetch, hasMore: list.hasMore, isLoadingMore: list.isLoadingMore, loadMore: list.loadMore };
}
