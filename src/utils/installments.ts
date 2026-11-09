/**
 * Calculates the end month of a fixed payment with previously paid installments.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { shiftMonth } from '@/utils/format';

/**
 * Returns the month of the final installment generated after registration.
 *
 * @param startMonth - First generated due month, as `YYYY-MM`.
 * @param totalInstallments - Total installment count, or `null` for an open-ended payment.
 * @param paidInstallments - Installments paid before registration.
 * @returns The last month as `YYYY-MM`, or `null` when counts are missing or invalid.
 * @example
 * ```ts
 * installmentEndMonth('2026-10', 24, 13); // '2027-08'
 * ```
 */
export function installmentEndMonth(startMonth: string, totalInstallments: number | null, paidInstallments: number): string | null {
  if (totalInstallments === null || !Number.isInteger(totalInstallments) || totalInstallments <= 0
    || !Number.isInteger(paidInstallments) || paidInstallments < 0 || paidInstallments >= totalInstallments) return null;
  return shiftMonth(startMonth, totalInstallments - paidInstallments - 1);
}
