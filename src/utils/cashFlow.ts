/**
 * Helpers for the yearly cash flow matrix.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { CashFlowRow } from '@/types/overview';

/**
 * Drops the leading months that have no activity: no incomes, effective outflows, commitments,
 * flow or accumulated balance (an opening balance counts as activity).
 *
 * @param rows - The twelve months of the year, in order.
 * @returns The months from the first one with activity through December; empty when the year has none.
 * @example
 * ```ts
 * fromFirstActiveMonth(rows).map((row) => row.month); // ['2026-11', '2026-12']
 * ```
 */
export function fromFirstActiveMonth(rows: CashFlowRow[]): CashFlowRow[] {
  const first = rows.findIndex((row) => [row.incomes, row.accountExpenses, row.fixedPaid, row.cardPayments, row.outflows, row.pendingCommitments, row.flow, row.accumulated].some((value) => Number(value) !== 0));
  return first === -1 ? [] : rows.slice(first);
}
