/**
 * Sign-in and sign-up use cases with the error copy of the mockups.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/services/auth.service';
import type { AuthenticatedUser, SignInInput, SignUpInput } from '@/types/auth';

/** Result of {@link useSignIn}. */
export interface SignInState {
  /** Signs in; resolves the user, or `null` when it failed. */
  signIn: (input: SignInInput) => Promise<AuthenticatedUser | null>;
  /** Whether the request is in flight. */
  isSubmitting: boolean;
  /** Whether the credentials were rejected or the request failed. */
  hasFailed: boolean;
}

/**
 * Signs in and starts the session.
 *
 * @returns The sign-in action and its state.
 * @example
 * ```ts
 * const { signIn, hasFailed } = useSignIn();
 * ```
 */
export function useSignIn(): SignInState {
  const { startSession } = useAuth();
  const { submit, isSubmitting, error } = useMutation((input: SignInInput) => authService.signIn(input));
  const signIn = useCallback(
    async (input: SignInInput) => {
      const user = await submit(input);
      if (user) await startSession(user);
      return user;
    },
    [submit, startSession],
  );
  return { signIn, isSubmitting, hasFailed: error !== null };
}

/** Field error returned by {@link useSignUp}. */
export interface SignUpErrors {
  /** Email error, e.g. already registered. */
  email: string | null;
  /** General error. */
  general: string | null;
}

/** Result of {@link useSignUp}. */
export interface SignUpState {
  /** Creates the account; resolves whether it succeeded. */
  signUp: (input: SignUpInput) => Promise<boolean>;
  /** Whether the request is in flight. */
  isSubmitting: boolean;
  /** Errors returned by the server. */
  errors: SignUpErrors;
}

/**
 * Creates an account and starts the session; maps a conflict to the duplicated-email message.
 *
 * @returns The sign-up action and its state.
 * @example
 * ```ts
 * const { signUp, errors } = useSignUp();
 * ```
 */
export function useSignUp(): SignUpState {
  const { startSession } = useAuth();
  const { submit, isSubmitting, error } = useMutation((input: SignUpInput) => authService.signUp(input));
  const signUp = useCallback(
    async (input: SignUpInput) => {
      const user = await submit(input);
      if (!user) return false;
      await startSession(user, true);
      return true;
    },
    [submit, startSession],
  );
  const isDuplicate = error?.status === 409;
  return {
    signUp,
    isSubmitting,
    errors: {
      email: isDuplicate ? 'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.' : null,
      general: error && !isDuplicate ? 'No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo.' : null,
    },
  };
}
