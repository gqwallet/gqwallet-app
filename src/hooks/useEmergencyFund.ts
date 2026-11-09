/**
 * Recommended emergency fund per currency (FR-039).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useResource, type ResourceState } from '@/hooks/useResource';
import { savingsService } from '@/services/savings.service';
import type { EmergencyFund } from '@/types/savings';

/** Funds of both currencies and whether an emergency-fund goal exists in each. */
export interface EmergencyFundData {
  /** Fund in soles. */
  pen: EmergencyFund;
  /** Fund in dollars. */
  usd: EmergencyFund;
  /** Whether there is an emergency-fund goal in soles. */
  hasPenGoal: boolean;
  /** Whether there is an emergency-fund goal in dollars. */
  hasUsdGoal: boolean;
}

/**
 * Loads the emergency fund of both currencies.
 *
 * @returns The fund state.
 * @example
 * ```ts
 * const { data } = useEmergencyFund();
 * ```
 */
export function useEmergencyFund(): ResourceState<EmergencyFundData> {
  return useResource(async (signal) => {
    const [pen, usd, goals] = await Promise.all([savingsService.getEmergencyFund('PEN', signal), savingsService.getEmergencyFund('USD', signal), savingsService.list(signal)]);
    return {
      pen,
      usd,
      hasPenGoal: goals.some((goal) => goal.emergencyFund && goal.currency === 'PEN'),
      hasUsdGoal: goals.some((goal) => goal.emergencyFund && goal.currency === 'USD'),
    };
  }, []);
}
