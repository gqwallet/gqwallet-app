/**
 * Current net position and server-calculated breakdown.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource, type ResourceState } from '@/hooks/useResource';
import { overviewService } from '@/services/overview.service';
import type { Currency } from '@/types/api';
import type { NetPosition } from '@/types/overview';

/**
 * Loads the breakdown of the net position.
 *
 * @param currency - Currency.
 * @returns The breakdown state.
 * @example
 * ```ts
 * const { data } = useNetPosition('PEN');
 * ```
 */
export function useNetPosition(currency: Currency): ResourceState<NetPosition> {
  return useResource((signal) => overviewService.getNetPosition(currency, signal), [currency]);
}
