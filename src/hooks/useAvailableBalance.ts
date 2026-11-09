/**
 * Available balance at a cutoff with its breakdown (FR-036).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource, type ResourceState } from '@/hooks/useResource';
import { overviewService } from '@/services/overview.service';
import type { Currency } from '@/types/api';
import type { AvailableBalance } from '@/types/overview';

/**
 * Loads the breakdown of the available balance.
 *
 * @param currency - Currency.
 * @param cutoff - Cutoff date (ISO date).
 * @returns The breakdown state.
 * @example
 * ```ts
 * const { data } = useAvailableBalance('PEN', '2026-06-03');
 * ```
 */
export function useAvailableBalance(currency: Currency, cutoff: string): ResourceState<AvailableBalance> {
  return useResource((signal) => overviewService.getAvailableBalance(currency, cutoff || undefined, signal), [currency, cutoff]);
}
