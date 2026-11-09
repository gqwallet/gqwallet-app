/**
 * Twelve-month debt load against a threshold (FR-037).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource, type ResourceState } from '@/hooks/useResource';
import { overviewService } from '@/services/overview.service';
import type { Currency } from '@/types/api';
import type { DebtLoad } from '@/types/overview';

/**
 * Loads the debt load series.
 *
 * @param year - Year.
 * @param currency - Currency.
 * @param threshold - Threshold percentage.
 * @returns The series state.
 * @example
 * ```ts
 * const { data } = useDebtLoad(2026, 'PEN', 7);
 * ```
 */
export function useDebtLoad(year: number, currency: Currency, threshold: number): ResourceState<DebtLoad> {
  return useResource((signal) => overviewService.getDebtLoad(year, currency, threshold, signal), [year, currency, threshold]);
}
