/**
 * Account endpoints (FR-020, FR-021).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { Account, AccountBalance, RegisterAccountInput, UpdateAccountInput } from '@/types/account';

/** Debit, savings and cash accounts with their calculated balance. */
export const accountsService = {
  /**
   * Lists the accounts of the user, active and deactivated.
   *
   * @param signal - Cancels the request.
   * @returns Accounts.
   * @throws {@link ApiError} When the request fails.
   */
  list: (signal?: AbortSignal) => apiClient.get<Account[]>('/accounts', { signal }),
  /**
   * Fetches one account.
   *
   * @param id - Account identifier.
   * @param signal - Cancels the request.
   * @returns The account.
   * @throws {@link ApiError} When the request fails.
   */
  get: (id: string, signal?: AbortSignal) => apiClient.get<Account>(`/accounts/${id}`, { signal }),
  /**
   * Registers an account.
   *
   * @param input - Account data.
   * @returns The created account.
   * @throws {@link ApiError} When the request fails.
   */
  register: (input: RegisterAccountInput) => apiClient.post<Account>('/accounts', input),
  /**
   * Updates an account.
   *
   * @param id - Account identifier.
   * @param input - Editable fields.
   * @returns The updated account.
   * @throws {@link ApiError} When the request fails.
   */
  update: (id: string, input: UpdateAccountInput) => apiClient.put<Account>(`/accounts/${id}`, input),
  /**
   * Deactivates an account, keeping its movements.
   *
   * @param id - Account identifier.
   * @returns The deactivated account.
   * @throws {@link ApiError} When the request fails.
   */
  deactivate: (id: string) => apiClient.post<Account>(`/accounts/${id}/deactivations`),
  /**
   * Fetches the calculated balance at a cutoff (Rule B-6).
   *
   * @param id - Account identifier.
   * @param cutoff - Cutoff date; today when omitted.
   * @param signal - Cancels the request.
   * @returns The balance.
   * @throws {@link ApiError} When the request fails.
   */
  getBalance: (id: string, cutoff?: string, signal?: AbortSignal) =>
    apiClient.get<AccountBalance>(`/accounts/${id}/balance`, { params: { cutoff }, signal }),
};
