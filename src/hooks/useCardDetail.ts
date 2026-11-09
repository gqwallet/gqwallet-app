/**
 * One card: line usage, next billing and the expenses of its current cycle (FR-017, FR-022).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { cardsService } from '@/services/cards.service';
import { transactionsService } from '@/services/transactions.service';
import type { Card, CreditLineUsage, NextBilling } from '@/types/card';
import type { PayingAccount } from '@/hooks/useCards';
import { parseIsoDate, toIsoDate } from '@/utils/format';

/** Expense of the current cycle. */
export interface CycleExpense {
  /** Movement id. */
  id: string;
  /** Category name. */
  category: string;
  /** Merchant. */
  merchant: string | null;
  /** Economic date. */
  date: string;
  /** Amount. */
  amount: number;
}

/** Data of the card page. */
export interface CardDetailData {
  /** Card. */
  card: Card;
  /** Line usage. */
  usage: CreditLineUsage;
  /** Next billing. */
  nextBilling: NextBilling;
  /** Expenses of the current cycle, newest first. */
  expenses: CycleExpense[];
  /** Total consumption ever charged to the card. */
  consumption: number;
  /** Accounts that can pay the card. */
  accounts: PayingAccount[];
}

/**
 * Loads a card with its projections and cycle expenses.
 *
 * @param id - Card identifier; empty skips loading.
 * @returns The card page state.
 * @example
 * ```ts
 * const { data } = useCardDetail(id);
 * ```
 */
export function useCardDetail(id: string) {
  const resource = useResource(id ? async (signal) => {
    const [card, usage, nextBilling, categories, accounts, all] = await Promise.all([
      cardsService.get(id, signal),
      cardsService.getCreditLineUsage(id, signal),
      cardsService.getNextBilling(id, signal),
      transactionsService.listCategories('EXPENSE', signal),
      accountsService.list(signal),
      transactionsService.list({ instrumentId: id, nature: 'EXPENSE', status: 'ACTIVE', size: 1 }, signal),
    ]);
    const active = accounts.filter((account) => account.status === 'ACTIVE' && account.currency === card.currency);
    const balances = await Promise.all(active.map((account) => accountsService.getBalance(account.id, undefined, signal)));
    const names = new Map(categories.map((category) => [category.id, category.name]));
    return {
      card,
      usage,
      nextBilling,
      consumption: all.totals.reduce((sum, entry) => sum + entry.total, 0),
      names,
      expenses: [] as CycleExpense[],
      accounts: active.map((account, index) => ({ ...account, balance: balances[index].balance })),
    };
  } : null, [id]);
  const cycleStart = resource.data?.nextBilling.cycleStart;
  const cycleEnd = resource.data?.nextBilling.billingDate;
  // Include purchases after the previous closing day's cut-off, even if the cut-off was later removed.
  // Their persisted cycle assignment determines which expenses belong here.
  const fromDate = cycleStart ? parseIsoDate(cycleStart) : null;
  if (fromDate) fromDate.setDate(fromDate.getDate() - 1);
  const from = fromDate ? toIsoDate(fromDate) : undefined;
  const list = useInfiniteList(from && cycleEnd ? (page, signal) => transactionsService.list({ instrumentId: id, nature: 'EXPENSE', status: 'ACTIVE', from, to: cycleEnd, page, size: 20 }, signal) : null, JSON.stringify([id, from, cycleEnd]));
  const { refetch: refreshResource } = resource;
  const { reset } = list;
  const refetch = useCallback(() => { refreshResource(); reset(); }, [refreshResource, reset]);
  return { ...resource, refetch, paginationError: list.error,
    data: resource.data ? { ...resource.data, expenses: list.items.filter((transaction) => transaction.cycleClosingDate
      ? transaction.cycleClosingDate === cycleEnd : transaction.economicDate >= (cycleStart ?? '')).map((transaction) => ({ id: transaction.id, category: resource.data?.names.get(transaction.categoryId) ?? 'Gasto', merchant: transaction.merchant, date: transaction.economicDate, amount: transaction.amount })) } : null,
    hasMore: list.hasMore, isLoadingMore: list.isLoading || list.isLoadingMore, loadMore: list.loadMore };
}
