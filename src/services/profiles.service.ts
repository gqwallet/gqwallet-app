/**
 * Profile and exchange-rate endpoints (FR-003, FR-014, FR-047).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { ExchangeRate, Profile, RegisterExchangeRateInput, UpdateProfileInput } from '@/types/profile';

/** Profile of the signed-in user and referential exchange rates. */
export const profilesService = {
  /**
   * Fetches the profile of the signed-in user; also proves the session is valid.
   *
   * @param signal - Cancels the request.
   * @returns The profile.
   * @throws {@link ApiError} When the request fails.
   */
  getMine: (signal?: AbortSignal) => apiClient.get<Profile>('/profiles/me', { signal }),
  /**
   * Saves personal data and financial preferences.
   *
   * @param input - Editable fields.
   * @returns The updated profile.
   * @throws {@link ApiError} When the request fails.
   */
  updateMine: (input: UpdateProfileInput) => apiClient.put<Profile>('/profiles/me', input),
  /**
   * Lists the registered PEN/USD rates.
   *
   * @param signal - Cancels the request.
   * @returns Rates, newest first as returned by the server.
   * @throws {@link ApiError} When the request fails.
   */
  listExchangeRates: (signal?: AbortSignal) => apiClient.get<ExchangeRate[]>('/exchange-rates', { signal }),
  /**
   * Registers a referential PEN/USD rate.
   *
   * @param input - Rate and effective date.
   * @returns The registered rate.
   * @throws {@link ApiError} When the request fails.
   */
  registerExchangeRate: (input: RegisterExchangeRateInput) => apiClient.post<ExchangeRate>('/exchange-rates', input),
};
