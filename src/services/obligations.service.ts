/**
 * Fixed payment and payment due endpoints (FR-029 to FR-032).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { Currency, CurrencyFilter } from '@/types/api';
import type {
  FixedPayment, FixedPaymentSummary, PaymentDue, RegisterFixedPaymentInput, SettleDueInput, UpcomingDues, UpdateFixedPaymentInput,
} from '@/types/obligation';

/** Fixed payments, their monthly dues and summaries. */
export const obligationsService = {
  /**
   * Lists the fixed payments of the user.
   *
   * @param signal - Cancels the request.
   * @returns Fixed payments.
   * @throws {@link ApiError} When the request fails.
   */
  list: (signal?: AbortSignal) => apiClient.get<FixedPayment[]>('/fixed-payments', { signal }),
  /**
   * Fetches one fixed payment.
   *
   * @param id - Fixed payment identifier.
   * @param signal - Cancels the request.
   * @returns The fixed payment.
   * @throws {@link ApiError} When the request fails.
   */
  get: (id: string, signal?: AbortSignal) => apiClient.get<FixedPayment>(`/fixed-payments/${id}`, { signal }),
  /**
   * Registers a fixed payment; its due for the current month is generated right away.
   *
   * @param input - Fixed payment data.
   * @returns The created fixed payment.
   * @throws {@link ApiError} When the request fails.
   */
  register: (input: RegisterFixedPaymentInput) => apiClient.post<FixedPayment>('/fixed-payments', input),
  /**
   * Updates a fixed payment.
   *
   * @param id - Fixed payment identifier.
   * @param input - Editable fields.
   * @returns The updated fixed payment.
   * @throws {@link ApiError} When the request fails.
   */
  update: (id: string, input: UpdateFixedPaymentInput) => apiClient.put<FixedPayment>(`/fixed-payments/${id}`, input),
  /**
   * Finishes a fixed payment so it stops generating dues.
   *
   * @param id - Fixed payment identifier.
   * @returns The finished fixed payment.
   * @throws {@link ApiError} When the request fails.
   */
  finish: (id: string) => apiClient.post<FixedPayment>(`/fixed-payments/${id}/finishes`),
  /**
   * Exports the dues of a range as CSV.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param currency - Currency or `BOTH`.
   * @param signal - Cancels the request.
   * @returns CSV content and the server-provided filename.
   * @throws {@link ApiError} When the request fails.
   */
  exportDuesCsv: (from: string, to: string, currency: CurrencyFilter, signal?: AbortSignal) =>
    apiClient.getCsv('/payment-dues', { params: { from, to, currency }, signal }),
  /**
   * Exports the fixed payments active in a range as CSV.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param currency - Currency or `BOTH`.
   * @param signal - Cancels the request.
   * @returns CSV content and the server-provided filename.
   * @throws {@link ApiError} When the request fails.
   */
  exportFixedPaymentsCsv: (from: string, to: string, currency: CurrencyFilter, signal?: AbortSignal) =>
    apiClient.getCsv('/fixed-payments', { params: { from, to, currency }, signal }),
  /**
   * Lists dues between two dates.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param signal - Cancels the request.
   * @returns Dues.
   * @throws {@link ApiError} When the request fails.
   */
  listDues: (from: string, to: string, signal?: AbortSignal) =>
    apiClient.get<PaymentDue[]>('/payment-dues', { params: { from, to }, signal }),
  /**
   * Fetches pending dues grouped by urgency (FR-031).
   *
   * @param signal - Cancels the request.
   * @returns Grouped dues.
   * @throws {@link ApiError} When the request fails.
   */
  getUpcoming: (signal?: AbortSignal) => apiClient.get<UpcomingDues>('/upcoming-dues/me', { signal }),
  /**
   * Marks a due as paid in one step, creating its expense (FR-030).
   *
   * @param id - Due identifier.
   * @param input - Means, date and optional different amount.
   * @returns The paid due.
   * @throws {@link ApiError} When the request fails.
   */
  settle: (id: string, input: SettleDueInput) => apiClient.post<PaymentDue>(`/payment-dues/${id}/settlements`, input),
  /**
   * Skips a pending due without creating an expense or finishing its fixed payment.
   *
   * @param id - Due identifier.
   * @returns The voided due.
   * @throws {@link ApiError} When the request fails or the due is no longer pending.
   */
  voidDue: (id: string) => apiClient.post<PaymentDue>(`/payment-dues/${id}/voids`),
  /**
   * Fetches the monthly and annual totals of one currency (FR-032).
   *
   * @param currency - Currency.
   * @param signal - Cancels the request.
   * @returns The summary.
   * @throws {@link ApiError} When the request fails.
   */
  getSummary: (currency: Currency, signal?: AbortSignal) =>
    apiClient.get<FixedPaymentSummary>('/fixed-payment-summaries/me', { params: { currency }, signal }),
};
