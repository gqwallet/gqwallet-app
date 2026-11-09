/**
 * Referential consolidated view (FR-047): available balances and the month cash flow converted
 * with the last registered exchange rate.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useResource } from '@/hooks/useResource';
import { useMutation } from '@/hooks/useMutation';
import { overviewService } from '@/services/overview.service';
import { profilesService } from '@/services/profiles.service';
import type { ApiError, Currency } from '@/types/api';
import type { ConsolidatedPosition } from '@/types/overview';
import type { RegisterExchangeRateInput } from '@/types/profile';
import { todayIso } from '@/utils/format';

/** Month cash flow of both currencies and its referential sum. */
export interface ConsolidatedFlow {
  /** Month index 1 to 12. */
  month: number;
  /** Flow in soles. */
  pen: number;
  /** Flow in dollars. */
  usd: number;
  /** Flow converted to the target currency, absent without a rate. */
  consolidated: number | null;
}

/** Data of the consolidated view. */
export interface ConsolidatedData {
  /** Consolidated available position. */
  position: ConsolidatedPosition;
  /** Consolidated cash flow of the current month. */
  flow: ConsolidatedFlow;
}

/** Result of {@link useConsolidatedView}. */
export interface ConsolidatedState {
  /** Loaded data. */
  data: ConsolidatedData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Last load error. */
  error: ApiError | null;
  /** Registers a rate and reloads; resolves whether it succeeded. */
  registerRate: (input: RegisterExchangeRateInput) => Promise<boolean>;
  /** Whether the rate is being saved. */
  isSaving: boolean;
  /** Error of the last save. */
  saveError: string | null;
}

/**
 * Loads the consolidated position and the flow of the month, and registers new rates.
 *
 * @param target - Currency of the result.
 * @returns Data and the register action.
 * @example
 * ```ts
 * const { data, registerRate } = useConsolidatedView('PEN');
 * ```
 */
export function useConsolidatedView(target: Currency): ConsolidatedState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const today = todayIso();
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    const [position, pen, usd] = await Promise.all([
      overviewService.getConsolidatedPosition(target, signal),
      overviewService.getCashFlow(year, 'PEN', signal),
      overviewService.getCashFlow(year, 'USD', signal),
    ]);
    const penFlow = pen.rows[month - 1]?.flow ?? 0;
    const usdFlow = usd.rows[month - 1]?.flow ?? 0;
    const rate = position.rate;
    // Referential only: converts the foreign flow with the same rate the server used for the position.
    const consolidated = !position.available || rate === null ? null : target === 'PEN' ? penFlow + usdFlow * rate : usdFlow + penFlow / rate;
    return { position, flow: { month, pen: penFlow, usd: usdFlow, consolidated } };
  }, [target]);

  const { submit, isSubmitting, error: saveError } = useMutation((input: RegisterExchangeRateInput) => profilesService.registerExchangeRate(input));
  const registerRate = useCallback(
    async (input: RegisterExchangeRateInput) => {
      const saved = await submit(input);
      if (saved) refetch();
      return saved !== null;
    },
    [submit, refetch],
  );

  return {
    data,
    isLoading,
    error,
    registerRate,
    isSaving: isSubmitting,
    saveError: saveError ? 'Ingresa un tipo de cambio mayor a cero y una fecha válida.' : null,
  };
}
