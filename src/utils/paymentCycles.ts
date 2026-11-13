/**
 * Presentation labels for server-calculated payment cycle states.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { PaymentCycle, PaymentCycleStatus } from '@/types/card';

/** Presentation totals of the closed, unpaid statements returned by the server. */
export interface ClosedStatementSummary {
  /** Outstanding amount across closed statements only. */
  amountDue: number;
  /** Number of closed statements with a remaining balance. */
  count: number;
  /** Number of overdue closed statements with a remaining balance. */
  overdueCount: number;
}

/**
 * Aggregates authoritative statement balances for the card list and detail headers.
 * Open cycles and settled statements remain available for payments but are excluded from this total.
 * @param cycles - Server-calculated statements, including open cycles.
 * @param today - Local economic date in ISO format.
 * @returns Closed-statement totals without recalculating any statement balance.
 * @example
 * ```ts
 * const summary = summarizeClosedStatements(cycles, todayIso());
 * ```
 */
export function summarizeClosedStatements(cycles: PaymentCycle[], today: string): ClosedStatementSummary {
  const closed = cycles.filter(cycle => cycle.closingDate <= today && Number(cycle.amountDue) > 0);
  const units = closed.reduce((sum, cycle) => {
    const [whole, fraction = ''] = String(cycle.amountDue).split('.');
    return sum + BigInt(whole) * 10_000n + BigInt(fraction.padEnd(4, '0').slice(0, 4));
  }, 0n);
  return {
    // Convert only for the existing display formatter; monetary addition uses fixed-point integers.
    amountDue: Number(units) / 10_000,
    count: closed.length,
    overdueCount: closed.filter(cycle => cycle.status === 'OVERDUE').length,
  };
}

/** Returns the localized label of a payment cycle state. */
export function paymentCycleLabel(status: PaymentCycleStatus): string {
  return { PENDING: 'Pendiente', PARTIAL: 'Parcial', OVERDUE: 'Vencida', PAID: 'Pagada', OPEN: 'En curso' }[status];
}
