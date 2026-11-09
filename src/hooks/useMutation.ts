/**
 * Generic writer used by every write hook: runs a request and exposes its state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/types/api';

/** State returned by {@link useMutation}. */
export interface MutationState<TInput, TResult> {
  /** Runs the request; resolves `null` on failure so pages never catch. */
  submit: (input: TInput) => Promise<TResult | null>;
  /** Whether the request is in flight. */
  isSubmitting: boolean;
  /** Last error. */
  error: ApiError | null;
  /** Clears the error. */
  reset: () => void;
}

/**
 * Wraps a write request with submitting and error state.
 *
 * @typeParam TInput - Argument of the request.
 * @typeParam TResult - Result of the request.
 * @param run - Request to run.
 * @returns Submit action, submitting flag, error and reset.
 * @example
 * ```ts
 * const { submit } = useMutation((input: SignInInput) => authService.signIn(input));
 * ```
 */
export function useMutation<TInput, TResult>(run: (input: TInput) => Promise<TResult>): MutationState<TInput, TResult> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const runner = useRef(run);
  useEffect(() => {
    runner.current = run;
  });
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const submit = useCallback(async (input: TInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await runner.current(input);
      return result;
    } catch (reason) {
      if (isMounted.current) setError(reason instanceof ApiError ? reason : new ApiError(0));
      return null;
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);
  return { submit, isSubmitting, error, reset };
}
