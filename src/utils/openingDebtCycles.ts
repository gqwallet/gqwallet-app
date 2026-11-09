/**
 * Candidate dates for confirming opening debt before a card exists.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { BillingCycleOption } from '@/types/card';
import { nextDayOfMonth, parseIsoDate, toIsoDate } from '@/utils/format';

/** Builds recent closed and current date options without calculating billing amounts. */
export function openingDebtCycles(billingDay: number, paymentDay: number, today: string): BillingCycleOption[] {
  const current = parseIsoDate(nextDayOfMonth(billingDay, today));
  return [-3, -2, -1, 0].map((offset) => {
    const year = current.getFullYear();
    const month = current.getMonth() + offset;
    const closing = new Date(year, month, Math.min(billingDay, new Date(year, month + 1, 0).getDate()));
    const after = new Date(closing.getFullYear(), closing.getMonth(), closing.getDate() + 1);
    return { closingDate: toIsoDate(closing), paymentDueDate: nextDayOfMonth(paymentDay, toIsoDate(after)) };
  });
}
