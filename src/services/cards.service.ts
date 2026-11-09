/**
 * Credit card endpoints (FR-004 to FR-006, FR-017, FR-022).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { BillingCycleOption, Card, CreditLineUsage, NextBilling, PaymentCycle, RegisterCardInput, UpdateCardInput } from '@/types/card';

/** Credit cards with their line usage and billing projections. */
export const cardsService = {
  /**
   * Lists the cards of the user.
   *
   * @param signal - Cancels the request.
   * @returns Cards.
   * @throws {@link ApiError} When the request fails.
   */
  list: (signal?: AbortSignal) => apiClient.get<Card[]>('/cards', { signal }),
  /**
   * Fetches one card.
   *
   * @param id - Card identifier.
   * @param signal - Cancels the request.
   * @returns The card.
   * @throws {@link ApiError} When the request fails.
   */
  get: (id: string, signal?: AbortSignal) => apiClient.get<Card>(`/cards/${id}`, { signal }),
  /**
   * Registers a card.
   *
   * @param input - Card data.
   * @returns The created card.
   * @throws {@link ApiError} When the request fails.
   */
  register: (input: RegisterCardInput) => apiClient.post<Card>('/cards', input),
  /**
   * Updates a card.
   *
   * @param id - Card identifier.
   * @param input - Editable fields.
   * @returns The updated card.
   * @throws {@link ApiError} When the request fails.
   */
  update: (id: string, input: UpdateCardInput) => apiClient.put<Card>(`/cards/${id}`, input),
  /**
   * Deletes a card without movements.
   *
   * @param id - Card identifier.
   * @returns Nothing.
   * @throws {@link ApiError} When the request fails.
   */
  remove: (id: string) => apiClient.delete(`/cards/${id}`),
  /**
   * Lists the cycles a new expense can be assigned to.
   *
   * @param id - Card identifier.
   * @param signal - Cancels the request.
   * @returns Cycle options.
   * @throws {@link ApiError} When the request fails.
   */
  listBillingCycles: (id: string, signal?: AbortSignal) => apiClient.get<BillingCycleOption[]>(`/cards/${id}/billing-cycles`, { signal }),
  /**
   * Fetches the used and available line (Rule B-7).
   *
   * @param id - Card identifier.
   * @param signal - Cancels the request.
   * @returns Line usage.
   * @throws {@link ApiError} When the request fails.
   */
  getCreditLineUsage: (id: string, signal?: AbortSignal) => apiClient.get<CreditLineUsage>(`/cards/${id}/credit-line-usage`, { signal }),
  /**
   * Fetches the projection of the next billing (FR-017).
   *
   * @param id - Card identifier.
   * @param signal - Cancels the request.
   * @returns Next billing.
   * @throws {@link ApiError} When the request fails.
   */
  getNextBilling: (id: string, signal?: AbortSignal) => apiClient.get<NextBilling>(`/cards/${id}/next-billing`, { signal }),
  /**
   * Lists the payment cycles of a card for card payments.
   *
   * @param id - Card identifier.
   * @param signal - Cancels the request.
   * @returns Payment cycles.
   * @throws {@link ApiError} When the request fails.
   */
  listPaymentCycles: (id: string, signal?: AbortSignal) => apiClient.get<PaymentCycle[]>(`/cards/${id}/payment-cycles`, { signal }),
};
