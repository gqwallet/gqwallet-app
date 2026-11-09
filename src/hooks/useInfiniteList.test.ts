/**
 * Tests incremental pagination, cancellation, mutation resets and recoverable failures.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { ApiError, type Page } from '@/types/api';

interface Row {
  id: string;
}

function page(number: number, ids: string[], totalPages = 2): Page<Row> {
  return { content: ids.map((id) => ({ id })), page: number, size: 20, totalElements: 25, totalPages };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('useInfiniteList', () => {
  it('accumulates page two in server order, deduplicates ids and ignores concurrent load requests', async () => {
    const second = deferred<Page<Row>>();
    const load = vi.fn<(number: number, signal: AbortSignal) => Promise<Page<Row>>>()
      .mockResolvedValueOnce(page(0, ['a', 'a', 'b']))
      .mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useInfiniteList(load, 'PEN'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.map((row) => row.id)).toEqual(['a', 'b']);
    expect(result.current.hasMore).toBe(true);

    act(() => { result.current.loadMore(); result.current.loadMore(); });
    expect(load.mock.calls.map(([number]) => number)).toEqual([0, 1]);
    expect(load.mock.calls[1][1]).toBeInstanceOf(AbortSignal);
    expect(result.current.isLoadingMore).toBe(true);
    expect(result.current.items.map((row) => row.id)).toEqual(['a', 'b']);

    await act(async () => { second.resolve(page(1, ['b', 'c', 'c'])); });
    await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
    expect(result.current.items.map((row) => row.id)).toEqual(['a', 'b', 'c']);
    expect(result.current.totalElements).toBe(25);
    expect(result.current.hasMore).toBe(false);
    act(() => result.current.loadMore());
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('aborts an old filter request and ignores its late result', async () => {
    const stale = deferred<Page<Row>>();
    const current = deferred<Page<Row>>();
    const load = vi.fn<(number: number, signal: AbortSignal) => Promise<Page<Row>>>()
      .mockReturnValueOnce(stale.promise)
      .mockReturnValueOnce(current.promise);
    const { result, rerender } = renderHook(({ filter }) => useInfiniteList(load, filter), { initialProps: { filter: 'PEN' } });
    const staleSignal = load.mock.calls[0][1];
    rerender({ filter: 'USD' });
    expect(staleSignal.aborted).toBe(true);
    expect(load.mock.calls.map(([number]) => number)).toEqual([0, 0]);
    expect(result.current.items).toEqual([]);

    await act(async () => { current.resolve(page(0, ['current'], 1)); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => { stale.resolve(page(0, ['stale'])); });
    expect(result.current.items.map((row) => row.id)).toEqual(['current']);
    expect(result.current.hasMore).toBe(false);
  });

  it('cancels an in-flight append request on unmount', async () => {
    const pending = deferred<Page<Row>>();
    const load = vi.fn<(number: number, signal: AbortSignal) => Promise<Page<Row>>>()
      .mockResolvedValueOnce(page(0, ['a']))
      .mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useInfiniteList(load, 'PEN'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.loadMore());
    const signal = load.mock.calls[1][1];
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => { pending.resolve(page(1, ['ignored'])); });
  });

  it('resets accumulated pages after a mutation and reloads page zero', async () => {
    const refreshed = deferred<Page<Row>>();
    const load = vi.fn<(number: number, signal: AbortSignal) => Promise<Page<Row>>>()
      .mockResolvedValueOnce(page(0, ['old']))
      .mockResolvedValueOnce(page(1, ['older']))
      .mockReturnValueOnce(refreshed.promise);
    const { result } = renderHook(() => useInfiniteList(load, 'PEN'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.reset());
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(load.mock.calls.map(([number]) => number)).toEqual([0, 1, 0]);
    await act(async () => { refreshed.resolve(page(0, ['new'], 1)); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.map((row) => row.id)).toEqual(['new']);
  });

  it('preserves loaded rows after an append failure and retries the same page', async () => {
    const failure = new ApiError(503);
    const load = vi.fn<(number: number, signal: AbortSignal) => Promise<Page<Row>>>()
      .mockResolvedValueOnce(page(0, ['a']))
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(page(1, ['b']));
    const { result } = renderHook(() => useInfiniteList(load, 'PEN'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.items.map((row) => row.id)).toEqual(['a']);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(load.mock.calls.map(([number]) => number)).toEqual([0, 1, 1]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(false);
  });
});
