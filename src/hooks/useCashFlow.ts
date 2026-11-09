/**
 * Cash flow of a year (FR-035) and its CSV export (FR-041).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource, type ResourceState } from '@/hooks/useResource';
import { overviewService } from '@/services/overview.service';
import type { Currency } from '@/types/api';
import type { AvailableBalance, CashFlow } from '@/types/overview';
import { downloadText, exportFileName } from '@/utils/download';

/** Data of the cash flow page. */
export interface CashFlowData {
  /** Monthly matrix. */
  cashFlow: CashFlow;
  /** Opening balances of the currency. */
  opening: AvailableBalance;
}

/** Result of {@link useCashFlow}. */
export interface CashFlowState extends ResourceState<CashFlowData> {
  /** Downloads the CSV of the year; resolves whether it succeeded. */
  exportCsv: () => Promise<boolean>;
  /** Whether the export is running. */
  isExporting: boolean;
}

/**
 * Loads the cash flow matrix of a year and currency.
 *
 * @param year - Year.
 * @param currency - Currency.
 * @returns Matrix, opening balances and the export action.
 * @example
 * ```ts
 * const { data, exportCsv } = useCashFlow(2026, 'PEN');
 * ```
 */
export function useCashFlow(year: number, currency: Currency): CashFlowState {
  const state = useResource(async (signal) => {
    const [cashFlow, opening] = await Promise.all([
      overviewService.getCashFlow(year, currency, signal),
      overviewService.getAvailableBalance(currency, `${year}-01-01`, signal),
    ]);
    return { cashFlow, opening };
  }, [year, currency]);
  const { submit, isSubmitting } = useMutation(async () => {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    const file = await overviewService.exportCashFlowCsv(from, to, currency);
    downloadText(file.fileName ?? exportFileName('flujo_caja', from, to), file.content);
    return true;
  });
  const exportCsv = useCallback(async () => (await submit(undefined)) === true, [submit]);
  return { ...state, exportCsv, isExporting: isSubmitting };
}
