/**
 * Expense and income reports by period and currency (FR-040) with the movements CSV (FR-041).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { transactionsService, type ReportPeriod } from '@/services/transactions.service';
import type { ApiError } from '@/types/api';
import type { ExpenseReport, IncomeReport } from '@/types/transaction';
import { downloadText, exportFileName } from '@/utils/download';
import { monthRange } from '@/utils/format';

/** Report kind. */
export type ReportKind = 'EXPENSE' | 'INCOME';

/** Result of {@link useReports}. */
export interface ReportsState {
  /** Expense report, when the kind is `EXPENSE`. */
  expense: ExpenseReport | null;
  /** Income report, when the kind is `INCOME`. */
  income: IncomeReport | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Downloads the movements of the period as CSV; resolves whether it succeeded. */
  exportCsv: () => Promise<boolean>;
  /** Whether the export is running. */
  isExporting: boolean;
}

function rangeOf(period: ReportPeriod): { from: string; to: string } {
  if (period.month) return monthRange(`${period.year}-${String(period.month).padStart(2, '0')}`);
  return { from: `${period.year}-01-01`, to: `${period.year}-12-31` };
}

/**
 * Loads the report of a kind for a period.
 *
 * @param kind - Expenses or incomes.
 * @param period - Year, optional month and currency.
 * @returns Report, state and export action.
 * @example
 * ```ts
 * const { expense } = useReports('EXPENSE', { year: 2026, currency: 'PEN' });
 * ```
 */
export function useReports(kind: ReportKind, period: ReportPeriod): ReportsState {
  const { data, isLoading, error } = useResource(
    async (signal) =>
      kind === 'EXPENSE'
        ? { expense: await transactionsService.getExpenseReport(period, signal), income: null }
        : { expense: null, income: await transactionsService.getIncomeReport(period, signal) },
    [kind, period.year, period.month, period.currency],
  );
  const { submit, isSubmitting } = useMutation(async () => {
    const { from, to } = rangeOf(period);
    const file = await transactionsService.exportCsv(from, to, period.currency);
    downloadText(file.fileName ?? exportFileName('movimientos', from, to), file.content);
    return true;
  });
  const exportCsv = useCallback(async () => (await submit(undefined)) === true, [submit]);
  return { expense: data?.expense ?? null, income: data?.income ?? null, isLoading, error, exportCsv, isExporting: isSubmitting };
}
