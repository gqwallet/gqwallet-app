/**
 * Loads cancellable pages and keeps an ordered, unique list.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, type Page } from '@/types/api';

/** State and actions for an incrementally loaded collection. */
export interface InfiniteListState<T> {
  /** Unique loaded rows, in server order. */
  items: T[];
  /** Matching rows reported by the server. */
  totalElements: number;
  /** Whether another page exists. */
  hasMore: boolean;
  /** Whether the initial page is loading. */
  isLoading: boolean;
  /** Whether a later page is loading. */
  isLoadingMore: boolean;
  /** Last request failure. */
  error: ApiError | null;
  /** Loads the next page, or retries a failed request. */
  loadMore: () => void;
  /** Discards accumulated pages and reloads page zero. */
  reset: () => void;
}

/**
 * Accumulates pages, cancels stale requests and resets when the filter key changes.
 *
 * @typeParam T - Row with a stable identifier.
 * @param load - Page loader, or null while required inputs are unavailable.
 * @param filterKey - Serialized filters that identify the collection.
 * @returns Rows, server count, loading state and pagination actions.
 * @example
 * ```ts
 * const list = useInfiniteList((page, signal) => service.list({ page, size: 20 }, signal), key);
 * ```
 */
export function useInfiniteList<T extends { id: string }>(load: ((page: number, signal: AbortSignal) => Promise<Page<T>>) | null, filterKey: string): InfiniteListState<T> {
  const [version, setVersion] = useState(0);
  const key = `${filterKey}:${version}:${load !== null}`;
  const [state, setState] = useState({ key, items: [] as T[], totalElements: 0, hasMore: true, isLoading: load !== null, isLoadingMore: false, error: null as ApiError | null });
  const loader = useRef(load);
  const request = useRef<AbortController | null>(null);
  const nextPage = useRef(0);
  const activeKey = useRef(key);
  const more = useRef(true);
  useEffect(() => { loader.current = load; });
  const run = useCallback((currentKey: string) => {
    if (request.current || !more.current || !loader.current || activeKey.current !== currentKey) return;
    const controller = new AbortController();
    request.current = controller;
    const page = nextPage.current;
    setState((current) => ({ ...current, isLoading: page === 0, isLoadingMore: page > 0, error: null }));
    void loader.current(page, controller.signal).then((result) => {
      if (controller.signal.aborted || activeKey.current !== currentKey) return;
      nextPage.current = result.page + 1;
      more.current = nextPage.current < result.totalPages;
      setState((current) => {
        const ids = new Set(current.items.map((item) => item.id));
        const additions = result.content.filter((item) => { if (ids.has(item.id)) return false; ids.add(item.id); return true; });
        return { ...current, items: [...current.items, ...additions], totalElements: result.totalElements, hasMore: more.current };
      });
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted && activeKey.current === currentKey) setState((current) => ({ ...current, error: reason instanceof ApiError ? reason : new ApiError(0) }));
    }).finally(() => {
      if (!controller.signal.aborted && activeKey.current === currentKey) {
        request.current = null;
        setState((current) => ({ ...current, isLoading: false, isLoadingMore: false }));
      }
    });
  }, []);
  useEffect(() => {
    request.current?.abort(); request.current = null;
    activeKey.current = key; nextPage.current = 0; more.current = true;
    setState({ key, items: [], totalElements: 0, hasMore: true, isLoading: loader.current !== null, isLoadingMore: false, error: null });
    run(key);
    return () => { request.current?.abort(); request.current = null; };
  }, [key, run]);
  const loadMore = useCallback(() => run(key), [key, run]);
  const reset = useCallback(() => { request.current?.abort(); request.current = null; setVersion((current) => current + 1); }, []);
  const visible = state.key === key ? state : { items: [], totalElements: 0, hasMore: false, isLoading: load !== null, isLoadingMore: false, error: null };
  return { ...visible, loadMore, reset };
}
