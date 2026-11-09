/**
 * Reads available banks through the shared HTTP client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { Bank } from '@/types/catalog';

/** Read access to country catalogs. */
export const catalogsService = {
  /**
   * Lists active banks sorted by name.
   *
   * @param country - Uppercase ISO country code.
   * @param signal - Cancels the request.
   * @returns Available banks.
   * @throws {@link ApiError} When the request fails.
   */
  listBanks: (country: string, signal?: AbortSignal) => apiClient.get<Bank[]>('/banks', { params: { country }, signal }),
};
