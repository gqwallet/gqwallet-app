/**
 * Calendar sync and admin metrics endpoints (FR-013, FR-016).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { CalendarLink, DailyTransactionCount, PlatformMetrics } from '@/types/platform';

/** Google Calendar link and aggregated platform metrics. */
export const platformService = {
  /**
   * Links Google Calendar with an OAuth authorization code and syncs three months.
   *
   * @param authorizationCode - Code returned by the Google consent screen.
   * @returns The active link.
   * @throws {@link ApiError} When the request fails.
   */
  linkCalendar: (authorizationCode: string) => apiClient.post<CalendarLink>('/calendar-links', { authorizationCode }),
  /**
   * Forces a synchronization of a link.
   *
   * @param id - Link identifier.
   * @returns The link with its last sync instant.
   * @throws {@link ApiError} When the request fails.
   */
  synchronize: (id: string) => apiClient.post<CalendarLink>(`/calendar-links/${id}/synchronizations`),
  /**
   * Revokes a calendar link.
   *
   * @param id - Link identifier.
   * @returns Nothing.
   * @throws {@link ApiError} When the request fails.
   */
  unlink: (id: string) => apiClient.delete(`/calendar-links/${id}`),
  /**
   * Fetches registered and active users; administrators only.
   *
   * @param signal - Cancels the request.
   * @returns The metrics.
   * @throws {@link ApiError} When the request fails.
   */
  getMetrics: (signal?: AbortSignal) => apiClient.get<PlatformMetrics>('/metrics', { signal }),
  /**
   * Lists movements registered per day; administrators only.
   *
   * @param from - Start date.
   * @param to - End date.
   * @param signal - Cancels the request.
   * @returns Daily counts.
   * @throws {@link ApiError} When the request fails.
   */
  listDailyCounts: (from: string, to: string, signal?: AbortSignal) =>
    apiClient.get<DailyTransactionCount[]>('/daily-transaction-counts', { params: { from, to }, signal }),
};
