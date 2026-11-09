/**
 * Budget endpoints (FR-033, FR-034).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { Currency, CurrencyFilter } from '@/types/api';
import type { Budget, BudgetCopy, BudgetStatus, CreateBudgetInput } from '@/types/budget';

/** Monthly limits per category and the budget table. */
export const budgetsService = {
  /**
   * Lists the limits of one month and currency.
   *
   * @param period - Month `YYYY-MM`.
   * @param currency - Currency.
   * @param signal - Cancels the request.
   * @returns Limits.
   * @throws {@link ApiError} When the request fails.
   */
  list: (period: string, currency: Currency, signal?: AbortSignal) =>
    apiClient.get<Budget[]>('/budgets', { params: { period, currency }, signal }),
  /**
   * Defines the limit of a category, month and currency.
   *
   * @param input - Limit data.
   * @returns The created limit.
   * @throws {@link ApiError} When the request fails.
   */
  create: (input: CreateBudgetInput) => apiClient.post<Budget>('/budgets', input),
  /**
   * Changes a limit.
   *
   * @param id - Budget identifier.
   * @param limit - New limit.
   * @returns The updated limit.
   * @throws {@link ApiError} When the request fails.
   */
  update: (id: string, limit: number) => apiClient.put<Budget>(`/budgets/${id}`, { limit }),
  /**
   * Removes a limit.
   *
   * @param id - Budget identifier.
   * @returns Nothing.
   * @throws {@link ApiError} When the request fails.
   */
  remove: (id: string) => apiClient.delete(`/budgets/${id}`),
  /**
   * Copies the limits of a month into another without overwriting.
   *
   * @param fromPeriod - Source month.
   * @param toPeriod - Target month.
   * @returns Number of limits created.
   * @throws {@link ApiError} When the request fails.
   */
  copy: (fromPeriod: string, toPeriod: string) => apiClient.post<BudgetCopy>('/budget-copies', { fromPeriod, toPeriod }),
  /**
   * Fetches the budget table of a month and currency (FR-034).
   *
   * @param period - Month `YYYY-MM`.
   * @param currency - Currency.
   * @param signal - Cancels the request.
   * @returns The budget table.
   * @throws {@link ApiError} When the request fails.
   */
  getStatus: (period: string, currency: Currency, signal?: AbortSignal) =>
    apiClient.get<BudgetStatus>('/budget-statuses/me', { params: { period, currency }, signal }),
  /**
   * Exports budgets as CSV.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param currency - Currency or `BOTH`.
   * @param signal - Cancels the request.
   * @returns CSV content and the server-provided filename.
   * @throws {@link ApiError} When the request fails.
   */
  exportCsv: (from: string, to: string, currency: CurrencyFilter, signal?: AbortSignal) =>
    apiClient.getCsv('/budgets', { params: { from, to, currency }, signal }),
};
