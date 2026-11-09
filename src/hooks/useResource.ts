/**
 * Generic loader used by every read hook: runs a cancellable request and exposes its state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/types/api';

/** State returned by {@link useResource}. */
export interface ResourceState<TData> {
  /** Loaded data, `null` until the first success. */
  data: TData | null;
  /** Whether a request is in flight. */
  isLoading: boolean;
  /** Last error, cleared on the next success. */
  error: ApiError | null;
  /** Repeats the request. */
  refetch: () => void;
}

/**
 * Loads data with a request that receives an abort signal; it re-runs when `deps` change and
 * cancels on unmount.
 *
 * @typeParam TData - Shape of the loaded data.
 * @param load - Request to run; `null` skips loading.
 * @param deps - Values that trigger a reload.
 * @returns Data, loading flag, error and a refetch action.
 * @example
 * ```ts
 * const { data } = useResource((signal) => cardsService.list(signal), []);
 * ```
 */
export function useResource<TData>(load: ((signal: AbortSignal) => Promise<TData>) | null, deps: unknown[]): ResourceState<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(load !== null);
  const [error, setError] = useState<ApiError | null>(null);
  const [version, setVersion] = useState(0);
  const loader = useRef(load);
  useEffect(() => {
    loader.current = load;
  });

  useEffect(() => {
    const run = loader.current;
    if (!run) {
      setIsLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setIsLoading(true);
    run(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof ApiError ? reason : new ApiError(0));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass the request inputs as deps.
  }, [...deps, version]);

  const refetch = useCallback(() => setVersion((value) => value + 1), []);
  return { data, isLoading, error, refetch };
}
