/**
 * Savings goal and emergency fund endpoints (FR-038, FR-039).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { Currency, Page } from '@/types/api';
import type {
  Contribution, CreateSavingsGoalInput, EmergencyFund, RegisterContributionInput, SavingsGoal, UpdateSavingsGoalInput,
} from '@/types/savings';

/** Savings goals, their contributions and the emergency fund. */
export const savingsService = {
  /**
   * Lists the goals with their progress.
   *
   * @param signal - Cancels the request.
   * @returns Goals.
   * @throws {@link ApiError} When the request fails.
   */
  list: (signal?: AbortSignal) => apiClient.get<SavingsGoal[]>('/savings-goals', { signal }),
  /**
   * Fetches one goal.
   *
   * @param id - Goal identifier.
   * @param signal - Cancels the request.
   * @returns The goal.
   * @throws {@link ApiError} When the request fails.
   */
  get: (id: string, signal?: AbortSignal) => apiClient.get<SavingsGoal>(`/savings-goals/${id}`, { signal }),
  /**
   * Creates a goal; a second emergency fund in the same currency is rejected with 409.
   *
   * @param input - Goal data.
   * @returns The created goal.
   * @throws {@link ApiError} When the request fails.
   */
  create: (input: CreateSavingsGoalInput) => apiClient.post<SavingsGoal>('/savings-goals', input),
  /**
   * Updates a goal.
   *
   * @param id - Goal identifier.
   * @param input - Editable fields.
   * @returns The updated goal.
   * @throws {@link ApiError} When the request fails.
   */
  update: (id: string, input: UpdateSavingsGoalInput) => apiClient.put<SavingsGoal>(`/savings-goals/${id}`, input),
  /**
   * Lists the contributions of a goal.
   *
   * @param id - Goal identifier.
   * @param signal - Cancels the request.
   * @param page - Zero based page index.
   * @returns A page of contributions.
   * @throws {@link ApiError} When the request fails.
   */
  listContributions: (id: string, signal?: AbortSignal, page = 0) =>
    apiClient.get<Page<Contribution>>(`/savings-goals/${id}/contributions`, { params: { page, size: 20 }, signal }),
  /**
   * Contributes to a goal from an account of the same currency.
   *
   * @param id - Goal identifier.
   * @param input - Contribution data.
   * @returns The registered contribution.
   * @throws {@link ApiError} When the request fails.
   */
  contribute: (id: string, input: RegisterContributionInput) =>
    apiClient.post<Contribution>(`/savings-goals/${id}/contributions`, input),
  /**
   * Fetches the recommended emergency fund of one currency.
   *
   * @param currency - Currency.
   * @param signal - Cancels the request.
   * @returns The emergency fund.
   * @throws {@link ApiError} When the request fails.
   */
  getEmergencyFund: (currency: Currency, signal?: AbortSignal) =>
    apiClient.get<EmergencyFund>('/emergency-funds/me', { params: { currency }, signal }),
};
