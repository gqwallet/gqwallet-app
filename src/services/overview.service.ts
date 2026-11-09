/**
 * Dashboard and analysis endpoints (FR-009, FR-015, FR-035 to FR-037, FR-047).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { Currency, CurrencyFilter } from '@/types/api';
import type {
  AvailableBalance, CashFlow, ConsolidatedPosition, Dashboard, DebtLoad, PaymentCalendarEntry,
} from '@/types/overview';

/** Read-only compositions over the other contexts. */
export const overviewService = {
  /**
   * Fetches the dashboard of one currency.
   *
   * @param currency - Currency; the main one when omitted.
   * @param signal - Cancels the request.
   * @returns The dashboard.
   * @throws {@link ApiError} When the request fails.
   */
  getDashboard: (currency?: Currency, signal?: AbortSignal) =>
    apiClient.get<Dashboard>('/dashboards/me', { params: { currency }, signal }),
  /**
   * Fetches the available balance at a cutoff with its breakdown.
   *
   * @param currency - Currency.
   * @param cutoff - Cutoff date; today when omitted.
   * @param signal - Cancels the request.
   * @returns The breakdown.
   * @throws {@link ApiError} When the request fails.
   */
  getAvailableBalance: (currency: Currency, cutoff?: string, signal?: AbortSignal) =>
    apiClient.get<AvailableBalance>('/available-balances/me', { params: { currency, cutoff }, signal }),
  /**
   * Fetches the referential consolidated position.
   *
   * @param currency - Target currency; the main one when omitted.
   * @param signal - Cancels the request.
   * @returns The consolidated position.
   * @throws {@link ApiError} When the request fails.
   */
  getConsolidatedPosition: (currency?: Currency, signal?: AbortSignal) =>
    apiClient.get<ConsolidatedPosition>('/consolidated-positions/me', { params: { currency }, signal }),
  /**
   * Fetches the cash flow matrix of a year.
   *
   * @param year - Year.
   * @param currency - Currency.
   * @param signal - Cancels the request.
   * @returns The cash flow.
   * @throws {@link ApiError} When the request fails.
   */
  getCashFlow: (year: number, currency: Currency, signal?: AbortSignal) =>
    apiClient.get<CashFlow>('/cash-flows/me', { params: { year, currency }, signal }),
  /**
   * Exports the cash flow summary as CSV.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param currency - Currency or `BOTH`.
   * @param signal - Cancels the request.
   * @returns CSV content and the server-provided filename.
   * @throws {@link ApiError} When the request fails.
   */
  exportCashFlowCsv: (from: string, to: string, currency: CurrencyFilter, signal?: AbortSignal) =>
    apiClient.getCsv('/cash-flows/me', { params: { from, to, currency }, signal }),
  /**
   * Fetches the 12-month debt load series.
   *
   * @param year - Year.
   * @param currency - Currency.
   * @param threshold - Threshold percentage.
   * @param signal - Cancels the request.
   * @returns The debt load.
   * @throws {@link ApiError} When the request fails.
   */
  getDebtLoad: (year: number, currency: Currency, threshold: number, signal?: AbortSignal) =>
    apiClient.get<DebtLoad>('/debt-loads/me', { params: { year, currency, threshold }, signal }),
  /**
   * Lists card dates and dues between two dates.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param signal - Cancels the request.
   * @returns Calendar entries sorted by date.
   * @throws {@link ApiError} When the request fails.
   */
  listCalendarEntries: (from: string, to: string, signal?: AbortSignal) =>
    apiClient.get<PaymentCalendarEntry[]>('/payment-calendar-entries', { params: { from, to }, signal }),
};
