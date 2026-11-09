/**
 * Fixed payments summary of one currency (FR-032) with the active fixed payments.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource, type ResourceState } from '@/hooks/useResource';
import { obligationsService } from '@/services/obligations.service';
import type { Currency } from '@/types/api';
import type { FixedPayment, FixedPaymentSummary, PaymentDue } from '@/types/obligation';
import { monthOf, monthRange, todayIso } from '@/utils/format';

/** Data of the summary page. */
export interface FixedPaymentSummaryData {
  /** Server totals. */
  summary: FixedPaymentSummary;
  /** Active fixed payments of the currency. */
  active: FixedPayment[];
  /** Due of the current month by fixed payment, for installment and usual means. */
  currentDues: Record<string, PaymentDue>;
}

/**
 * Loads the summary and the active fixed payments of a currency.
 *
 * @param currency - Currency.
 * @returns The summary state.
 * @example
 * ```ts
 * const { data } = useFixedPaymentSummary('PEN');
 * ```
 */
export function useFixedPaymentSummary(currency: Currency): ResourceState<FixedPaymentSummaryData> {
  return useResource(async (signal) => {
    const { from, to } = monthRange(monthOf(todayIso()));
    const [summary, payments, dues] = await Promise.all([
      obligationsService.getSummary(currency, signal),
      obligationsService.list(signal),
      obligationsService.listDues(from, to, signal),
    ]);
    return {
      summary,
      active: payments.filter((payment) => payment.status === 'ACTIVE' && payment.currency === currency),
      currentDues: Object.fromEntries(dues.map((due) => [due.fixedPaymentId, due])),
    };
  }, [currency]);
}
