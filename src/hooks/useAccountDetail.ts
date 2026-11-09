/**
 * One account: balance breakdown, recent movements, edition and deactivation (FR-020, FR-021).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { transactionsService } from '@/services/transactions.service';
import type { Account, UpdateAccountInput } from '@/types/account';
import type { ApiError } from '@/types/api';
import type { Category, Transaction } from '@/types/transaction';
import { todayIso } from '@/utils/format';

/** Breakdown of the calculated balance (Rule B-6). */
export interface AccountBreakdown {
  /** Opening balance. */
  opening: number;
  /** Incomes into the account. */
  incomes: number;
  /** Expenses paid with the account. */
  expenses: number;
  /** Outgoing transfers. */
  transfersOut: number;
  /** Incoming transfers. */
  transfersIn: number;
  /** Server calculated balance. */
  balance: number;
}

/** Recent activity row. */
export interface AccountActivity {
  /** Identifier. */
  id: string;
  /** Movement or transfer. */
  type: 'transaction' | 'transfer';
  /** Title. */
  title: string;
  /** Economic date. */
  date: string;
  /** Detail (merchant or counterpart). */
  detail: string | null;
  /** Signed amount: positive adds to the account. */
  signedAmount: number;
}

/** Data of the account page. */
export interface AccountDetailData {
  /** Account. */
  account: Account;
  /** Balance breakdown. */
  breakdown: AccountBreakdown;
  /** Last three movements or transfers. */
  recent: AccountActivity[];
  /** Number of linked movements. */
  movementCount: number;
}

/** Result of {@link useAccountDetail}. */
export interface AccountDetailState {
  /** Loaded data. */
  data: AccountDetailData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Saves edited fields; resolves whether it succeeded. */
  update: (input: UpdateAccountInput) => Promise<boolean>;
  /** Deactivates the account; resolves whether it succeeded. */
  deactivate: () => Promise<boolean>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Error of the last write. */
  saveError: string | null;
}

/**
 * Loads an account with its breakdown and recent activity, and exposes edit and deactivate.
 *
 * @param id - Account identifier.
 * @returns Data and actions.
 * @example
 * ```ts
 * const { data, deactivate } = useAccountDetail(id);
 * ```
 */
export function useAccountDetail(id: string): AccountDetailState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const today = todayIso();
    const [account, balance, page, transfers, expense, income] = await Promise.all([
      accountsService.get(id, signal),
      accountsService.getBalance(id, today, signal),
      transactionsService.list({ instrumentId: id, to: today, status: 'ACTIVE', size: 3 }, signal),
      transactionsService.listTransfers({ accountId: id, to: today, size: 3 }, signal),
      transactionsService.listCategories('EXPENSE', signal),
      transactionsService.listCategories('INCOME', signal),
    ]);
    const categories = new Map<string, Category>([...expense, ...income].map((category) => [category.id, category]));
    const own = transfers.content;
    const total = (nature: Transaction['nature']) => page.totals.filter((entry) => entry.nature === nature).reduce((sum, entry) => sum + entry.total, 0);
    const recent: AccountActivity[] = [
      ...page.content.map((transaction) => ({
        id: transaction.id,
        type: 'transaction' as const,
        title: categories.get(transaction.categoryId)?.name ?? 'Movimiento',
        date: transaction.economicDate,
        detail: transaction.merchant,
        signedAmount: transaction.nature === 'INCOME' ? transaction.amount : -transaction.amount,
      })),
      ...own.filter((transfer) => transfer.status === 'ACTIVE').slice(0, 3).map((transfer) => ({
        id: transfer.id,
        type: 'transfer' as const,
        title: 'Transferencia',
        date: transfer.economicDate,
        detail: transfer.description ?? null,
        signedAmount: transfer.sourceAccountId === id ? -transfer.amount : transfer.amount,
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
    return {
      account,
      movementCount: page.totalElements,
      recent,
      breakdown: {
        opening: account.openingBalance,
        incomes: total('INCOME'),
        expenses: total('EXPENSE'),
        transfersOut: balance.transfersOut,
        transfersIn: balance.transfersIn,
        balance: balance.balance,
      },
    };
  }, [id]);

  const write = useMutation((run: () => Promise<Account>) => run());
  const { submit } = write;
  const update = useCallback(
    async (input: UpdateAccountInput) => {
      const saved = await submit(() => accountsService.update(id, input));
      if (saved) refetch();
      return saved !== null;
    },
    [submit, id, refetch],
  );
  const deactivate = useCallback(async () => (await submit(() => accountsService.deactivate(id))) !== null, [submit, id]);
  return {
    data,
    isLoading,
    error,
    update,
    deactivate,
    isSaving: write.isSubmitting,
    saveError: write.error ? (write.error.status === 409 ? 'Ya tienes una cuenta con este alias. Usa otro nombre.' : 'No guardamos los cambios. Revisa los datos.') : null,
  };
}
