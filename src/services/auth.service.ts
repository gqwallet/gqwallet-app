/**
 * Authentication endpoints: sign-up, sign-in and sign-out (FR-001, FR-002).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { apiClient } from '@/services/api-client';
import type { AuthenticatedUser, SignInInput, SignUpInput } from '@/types/auth';

/** Session operations; the backend sets and clears the httpOnly cookie. */
export const authService = {
  /**
   * Creates an account and opens a session.
   *
   * @param input - Email, password and consent.
   * @returns The created user.
   * @throws {@link ApiError} When the request fails.
   */
  signUp: (input: SignUpInput) => apiClient.post<AuthenticatedUser>('/authentication/sign-up', input),
  /**
   * Opens a session with valid credentials.
   *
   * @param input - Email and password.
   * @returns The signed-in user.
   * @throws {@link ApiError} When the request fails.
   */
  signIn: (input: SignInInput) => apiClient.post<AuthenticatedUser>('/authentication/sign-in', input),
  /**
   * Closes the session by clearing the cookie.
   *
   * @returns Nothing.
   * @throws {@link ApiError} When the request fails.
   */
  signOut: () => apiClient.post<void>('/authentication/sign-out'),
};
