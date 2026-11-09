/**
 * Tests of the generic loader.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useResource } from '@/hooks/useResource';

describe('useResource', () => {
  it('exposes the loaded data', async () => {
    const { result } = renderHook(() => useResource(() => Promise.resolve(5), []));
    await waitFor(() => expect(result.current.data).toBe(5));
    expect(result.current.isLoading).toBe(false);
  });
  it('exposes the error of a failed request', async () => {
    const { result } = renderHook(() => useResource(() => Promise.reject(new Error('x')), []));
    await waitFor(() => expect(result.current.error?.status).toBe(0));
  });
  it('skips loading without a request', () => {
    const { result } = renderHook(() => useResource(null, []));
    expect(result.current.isLoading).toBe(false);
  });
  it('cancels the request on unmount', () => {
    let captured: AbortSignal | null = null;
    const { unmount } = renderHook(() => useResource((signal) => { captured = signal; return new Promise(() => undefined); }, []));
    unmount();
    expect((captured as AbortSignal | null)?.aborted).toBe(true);
  });
});
