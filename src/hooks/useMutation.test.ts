/**
 * Tests of the generic writer.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMutation } from '@/hooks/useMutation';

describe('useMutation', () => {
  it('resolves the result', async () => {
    const { result } = renderHook(() => useMutation((value: number) => Promise.resolve(value * 2)));
    let value: number | null = null;
    await act(async () => { value = await result.current.submit(2); });
    expect(value).toBe(4);
  });
  it('resolves null and keeps the error on failure', async () => {
    const { result } = renderHook(() => useMutation(() => Promise.reject(new Error('x'))));
    await act(async () => { await result.current.submit(undefined); });
    expect(result.current.error?.status).toBe(0);
    act(() => result.current.reset());
    expect(result.current.error).toBeNull();
  });
});
