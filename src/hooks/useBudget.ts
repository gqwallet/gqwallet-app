/**
 * Budget of one month and currency (FR-033, FR-034): table, define a limit and copy limits.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { budgetsService } from '@/services/budgets.service';
import { transactionsService } from '@/services/transactions.service';
import type { ApiError, Currency } from '@/types/api';
import type { Budget, BudgetCopy, BudgetStatus } from '@/types/budget';
import type { Category } from '@/types/transaction';

/** Data of the budget page. */
export interface BudgetData {
  /** Budget table. */
  status: BudgetStatus;
  /** Limits of the month by category id. */
  limits: Record<string, Budget>;
  /** Active expense categories. */
  categories: Category[];
}

/** Preview of a copy between months. */
export interface CopyPreview {
  /** Limits in the source month. */
  source: number;
  /** Limits already defined in the target month. */
  existing: number;
  /** Limits that will be created. */
  toCreate: number;
}

/** Result of {@link useBudget}. */
export interface BudgetState {
  /** Loaded data. */
  data: BudgetData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Creates or updates the limit of a category; resolves whether it succeeded. */
  saveLimit: (categoryId: string, limit: number) => Promise<boolean>;
  /** Counts what a copy would create. */
  previewCopy: (fromPeriod: string) => Promise<CopyPreview>;
  /** Copies limits from another month; resolves the result or `null`. */
  copyFrom: (fromPeriod: string) => Promise<BudgetCopy | null>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Error of the last write. */
  saveError: string | null;
}

/**
 * Loads the budget table of a month and currency and exposes its write actions.
 *
 * @param period - Month `YYYY-MM`.
 * @param currency - Currency.
 * @returns Data and actions.
 * @example
 * ```ts
 * const { data, saveLimit } = useBudget('2026-06', 'PEN');
 * ```
 */
export function useBudget(period: string, currency: Currency): BudgetState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const [status, limits, categories] = await Promise.all([
      budgetsService.getStatus(period, currency, signal),
      budgetsService.list(period, currency, signal),
      transactionsService.listCategories('EXPENSE', signal),
    ]);
    return {
      status,
      limits: Object.fromEntries(limits.map((budget) => [budget.categoryId, budget])),
      categories: categories.filter((category) => category.status === 'ACTIVE').sort((a, b) => a.name.localeCompare(b.name, 'es')),
    };
  }, [period, currency]);

  const write = useMutation((run: () => Promise<unknown>) => run());
  const { submit } = write;
  const saveLimit = useCallback(
    async (categoryId: string, limit: number) => {
      const existing = data?.limits[categoryId];
      const done = await submit(() => (existing ? budgetsService.update(existing.id, limit) : budgetsService.create({ categoryId, period, currency, limit })));
      if (done !== null) refetch();
      return done !== null;
    },
    [submit, data, period, currency, refetch],
  );
  const previewCopy = useCallback(
    async (fromPeriod: string) => {
      const [source, target] = await Promise.all([budgetsService.list(fromPeriod, currency), budgetsService.list(period, currency)]);
      const existing = new Set(target.map((budget) => budget.categoryId));
      return { source: source.length, existing: target.length, toCreate: source.filter((budget) => !existing.has(budget.categoryId)).length };
    },
    [period, currency],
  );
  const copyFrom = useCallback(
    async (fromPeriod: string) => {
      const result = (await submit(() => budgetsService.copy(fromPeriod, period))) as BudgetCopy | null;
      if (result) refetch();
      return result;
    },
    [submit, period, refetch],
  );
  return { data, isLoading, error, saveLimit, previewCopy, copyFrom, isSaving: write.isSubmitting, saveError: write.error ? 'Ingresa un número mayor o igual a 0.' : null };
}
